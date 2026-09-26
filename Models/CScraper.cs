using Microsoft.Playwright;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using SmartSpend.Services;
using System.Threading;
using System.Web;

namespace SmartSpend.Models
{
    public class CScraper
    {
        // ---------- Settings ----------
        private const string Retailer = "Checkers Shoprite";
        private const bool Headless = false;          // set to true once you're happy with it
        private const int PageLoadTimeoutMs = 90000;  // generous for slow internet

        // ---------- Selectors ----------
        private const string CardSelector = "div.product-card_card__DsB3_";
        private const string TitleSelector = ".product-card_product-name__8wxGT";
        private const string PriceSelector = ".product-card_product-price___sw_8";
        private const string ImageSelector = "img";

        // If the site uses a "Load more" button instead of infinite scroll, this clicks it.
        private const string LoadMoreSelector = "button:has-text('Load more'), button:has-text('Show more')";

        // ---------- Category links (paste your links here) ----------
        private const string FruitsUrl = "https://www.checkers.co.za/department/fruit-veg-and-salads/fruits-2-67075da3ff9878113640070c";
        private const string MeatUrl = "https://www.checkers.co.za/merchandised-page/meat-and-poultry-649c7710493dc19d2da29898";
        private const string RiceUrl = "https://www.checkers.co.za/merchandised-page/pasta-rice-and-grains-65b8c6643557fdff25aa9910";
        private const string VegetablesUrl = "https://www.checkers.co.za/department/fruit-veg-and-salads/vegetables-2-67075da8ff98781136400718";
        private const string SnacksUrl = "https://www.checkers.co.za/merchandised-page/sweets-and-snacks-649eca86fb5ce814204234c7";


        // Only one scrape may run at a time (across the whole app).
        private static readonly SemaphoreSlim RunLock = new SemaphoreSlim(1, 1);

        // ---------- Public API (call these from the controller) ----------
        public Task<int> RunFruits() { return RunCategory("Fruits", FruitsUrl); }
        public Task<int> RunMeat() { return RunCategory("Meat", MeatUrl); }
        public Task<int> RunRice() { return RunCategory("Rice", RiceUrl); }
        public Task<int> RunVegetables() { return RunCategory("Vegetables", VegetablesUrl); }
        public Task<int> RunSnacks() { return RunCategory("Snacks", SnacksUrl); }

        // ---------- Core ----------
        // Returns number of items saved, or -1 if another scrape was already running.
        private async Task<int> RunCategory(string category, string url)
        {
            if (!await RunLock.WaitAsync(0))
            {
                System.Diagnostics.Debug.WriteLine("Scraper already running - skipped " + category);
                return -1;
            }

            try
            {
                var items = await ScrapeCategory(category, url);

                if (items.Count > 0)
                {
                    using (var db = new ApplicationDbContext())
                    {
                        db.ScrapedItems.AddRange(items);
                        await db.SaveChangesAsync();
                    }
                }

                System.Diagnostics.Debug.WriteLine(category + " SAVED: " + items.Count);

                // Work out dietary tags for the new products now, so the Main page never has to.
                // Never throws; anything it can't finish is picked up on the next run.
                if (items.Count > 0)
                    await DietaryFilterService.TagUncheckedAsync();

                return items.Count;
            }
            finally
            {
                RunLock.Release();
            }
        }

        private async Task<List<ScrapedItems>> ScrapeCategory(string category, string url)
        {
            var items = new List<ScrapedItems>();

            using (var playwright = await Playwright.CreateAsync())
            {
                var browser = await playwright.Chromium.LaunchAsync(
                    new BrowserTypeLaunchOptions { Headless = Headless });

                try
                {
                    var page = await browser.NewPageAsync();
                    page.SetDefaultTimeout(PageLoadTimeoutMs);

                    await page.GotoAsync(url, new PageGotoOptions
                    {
                        WaitUntil = WaitUntilState.DOMContentLoaded,
                        Timeout = PageLoadTimeoutMs
                    });

                    System.Diagnostics.Debug.WriteLine(category + " PAGE LOADED: " + page.Url);

                    // Wait for a card that actually has a price, not just an empty
                    // placeholder/skeleton card (those can share the same CSS class).
                    await page.WaitForSelectorAsync(PriceSelector,
                        new PageWaitForSelectorOptions { Timeout = PageLoadTimeoutMs });

                    // Keep scrolling / clicking "load more" until no new products appear
                    await LoadAllProducts(page);

                    // Read every card in ONE go inside the browser. This avoids errors when the
                    // page's JS re-renders cards while we're looping over them.
                    var rows = await page.Locator(CardSelector).EvaluateAllAsync<string[][]>(
                        @"(els, s) => els.map(el => {
                            const t = el.querySelector(s.title);
                            const p = el.querySelector(s.price);
                            const i = el.querySelector(s.image);
                            return [
                                t ? t.innerText.trim() : null,
                                p ? p.innerText.trim() : null,
                                i ? (i.currentSrc || i.getAttribute('src') || i.getAttribute('data-src')) : null
                            ];
                        })",
                        new { title = TitleSelector, price = PriceSelector, image = ImageSelector });

                    var seen = new HashSet<string>();
                    int skipped = 0;

                    foreach (var row in rows)
                    {
                        var title = row[0];
                        var priceText = row[1];
                        var imageUrl = row[2];

                        decimal price;
                        if (string.IsNullOrWhiteSpace(title) || !TryParsePrice(priceText, out price))
                        {
                            skipped++;
                            continue;
                        }

                        // Skip duplicates caused by re-rendering
                        if (!seen.Add(title + "|" + price.ToString(CultureInfo.InvariantCulture)))
                            continue;

                        items.Add(new ScrapedItems
                        {
                            Title = title,
                            Price = price,
                            ImageUrl = imageUrl,
                            Retailer = Retailer,
                            Category = category,
                            Availability = "Available"
                        });
                    }

                    System.Diagnostics.Debug.WriteLine(
                        category + ": " + rows.Length + " cards found, " + skipped + " skipped, " + items.Count + " kept");

                    // If nothing was scraped, save a screenshot so you can see what the page looked like
                    if (items.Count == 0)
                    {
                        var path = Path.Combine(Path.GetTempPath(), "scrape_" + category + ".png");
                        await page.ScreenshotAsync(new PageScreenshotOptions { Path = path, FullPage = true });
                        System.Diagnostics.Debug.WriteLine("No items - screenshot saved to " + path);
                    }
                }
                finally
                {
                    await browser.CloseAsync();
                }
            }

            return items;
        }

        // ---------- Helpers ----------
        private static async Task LoadAllProducts(IPage page)
        {
            int previous = -1;
            int stableRounds = 0;

            // Stop once the product count hasn't changed for 5 rounds (or after 60 rounds max)
            for (int round = 0; round < 60 && stableRounds < 5; round++)
            {
                await page.EvaluateAsync("window.scrollBy(0, window.innerHeight * 0.9)");

                var loadMore = page.Locator(LoadMoreSelector).First;
                if (await loadMore.IsVisibleAsync())
                {
                    try { await loadMore.ClickAsync(new LocatorClickOptions { Timeout = 3000 }); }
                    catch (PlaywrightException) { }
                }

                await page.WaitForTimeoutAsync(800);

                var current = await page.Locator(PriceSelector).CountAsync();
                if (current == previous)
                {
                    stableRounds++;
                }
                else
                {
                    stableRounds = 0;
                    previous = current;
                }
            }

            System.Diagnostics.Debug.WriteLine("Products loaded on page: " + previous);
        }

        // Handles "R 24.99", "R24,99", "24.99", etc.
        private static bool TryParsePrice(string text, out decimal price)
        {
            price = 0;
            if (string.IsNullOrWhiteSpace(text)) return false;

            var match = Regex.Match(text, @"\d+(?:[.,]\d{1,2})?");
            return match.Success && decimal.TryParse(
                match.Value.Replace(',', '.'),
                NumberStyles.Number,
                CultureInfo.InvariantCulture,
                out price);
        }
    }
}