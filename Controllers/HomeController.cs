using Microsoft.AspNet.Identity;
using QuestPDF.Fluent;
using SmartSpend.Models;
using SmartSpend.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace SmartSpend.Controllers
{
    public class HomeController : Controller
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [Authorize]
        public ActionResult Main()
        {
            /*TempData["Success"] = "Toast.";*/
            string mail = User.Identity.Name;
            ViewBag.email = mail;
            ViewBag.lett = mail[0];
            string uid = User.Identity.GetUserId();

            // Distance filter: the address saved during onboarding is geocoded in the browser
            // (Google Maps Platform), so no lat/lng needs to be stored - just hand the text over.
            var prefs = db.UserPreferences.AsNoTracking().FirstOrDefault(x => x.UserId == uid);
            ViewBag.savedAddress = prefs?.Address;
            ViewBag.mapsKey = GetMapsApiKey();

            // Dietary filter chip: the shopper's saved dietary needs / allergies.
            var dietaryProfile = DietaryProfile.From(prefs?.DietaryNeeds, prefs?.Allergies);
            ViewBag.hasDietaryFilter = !dietaryProfile.IsEmpty;

            // Products this user right-clicked "I don't want to see this again" on -
            // filtered out of the catalogue entirely, same key shape as favourites.
            var dislikedKeys = new HashSet<string>(
                db.UserDislikes
                    .Where(d => d.userId == uid)
                    .Select(d => new { d.productname, d.store })
                    .ToList()
                    .Select(d => MainViewModel.FavKey(d.productname, d.store)));

            // Cheapest first inside each category (matches the "Sort: Price" chip).
            var items = db.ScrapedItems
                .AsNoTracking()
                .OrderBy(x => x.Price)
                .ThenBy(x => x.Title)
                .ToList()
                .Where(x => !dislikedKeys.Contains(MainViewModel.FavKey(x.Title, x.Retailer)))
                .ToList();

            // Products the dietary filter hides for this shopper. This is only a fast in-memory check of
            // the tags saved after each scrape (no AI call). The page still renders these products,
            // marked, so the Dietary chip can switch the filter off again.
            ViewBag.dietaryHidden = dietaryProfile.IsEmpty
                ? new HashSet<int>()
                : new HashSet<int>(items
                    .Where(x => DietaryFilterService.ShouldHide(dietaryProfile, x.Title, x.Category, x.DietaryTags, x.DietaryChecked))
                    .Select(x => x.Id));

            var categories = items
                .GroupBy(x => string.IsNullOrWhiteSpace(x.Category) ? "Other" : x.Category.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(g => new CategoryGroup { Name = g.Key, Items = g.ToList() })
                .OrderBy(g => g.Name == "Other")   // "Other" always last
                .ThenBy(g => g.Name)
                .ToList();

            // Which products this user has already favourited (so the heart renders filled).
            var favKeys = db.UserFavorites
                .Where(f => f.userId == uid)
                .Select(f => new { f.productname, f.store })
                .ToList()
                .Select(f => MainViewModel.FavKey(f.productname, f.store));

            var model = new MainViewModel
            {
                Categories = categories,
                FavouriteKeys = new HashSet<string>(favKeys)
            };

            return View(model);
        }

        // Adds the product to the user's favourites, or removes it if it is already there.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult ToggleFavourite(int id)
        {
            string uid = User.Identity.GetUserId();
            if (string.IsNullOrEmpty(uid))
                return Json(new { success = false, message = "Please log in to save favourites." });

            // Look the product up server-side instead of trusting name/price/store from the browser.
            var item = db.ScrapedItems.Find(id);
            if (item == null)
                return Json(new { success = false, message = "That product is no longer available." });

            var existing = db.UserFavorites
                .Where(x => x.userId == uid && x.productname == item.Title && x.store == item.Retailer)
                .ToList();

            bool favourited;
            if (existing.Any())
            {
                db.UserFavorites.RemoveRange(existing);
                favourited = false;
            }
            else
            {
                db.UserFavorites.Add(new UserFavorites
                {
                    userId = uid,
                    productname = item.Title,
                    price = item.Price.ToString("0.00", CultureInfo.InvariantCulture),
                    store = item.Retailer,
                    image = item.ImageUrl,
                    DateAdded = DateTime.Now
                });
                favourited = true;
            }

            db.SaveChanges();
            return Json(new { success = true, favourited = favourited });
        }

        // Called from the product card's right-click context menu ("I don't want to
        // see this again"). Records the dislike and, since it's now hidden from the
        // catalogue, also removes it from favourites if it was favourited.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult DislikeProduct(int id)
        {
            string uid = User.Identity.GetUserId();
            if (string.IsNullOrEmpty(uid))
                return Json(new { success = false, message = "Please log in to manage this." });

            // Look the product up server-side instead of trusting anything from the browser.
            var item = db.ScrapedItems.Find(id);
            if (item == null)
                return Json(new { success = false, message = "That product is no longer available." });

            bool alreadyDisliked = db.UserDislikes
                .Any(x => x.userId == uid && x.productname == item.Title && x.store == item.Retailer);

            if (!alreadyDisliked)
            {
                db.UserDislikes.Add(new UserDisliked
                {
                    userId = uid,
                    productname = item.Title,
                    price = item.Price.ToString("0.00", CultureInfo.InvariantCulture),
                    store = item.Retailer,
                    image = item.ImageUrl,
                    DateAdded = DateTime.Now
                });

                // No point keeping it favourited if the user never wants to see it again.
                var favMatch = db.UserFavorites
                    .Where(f => f.userId == uid && f.productname == item.Title && f.store == item.Retailer)
                    .ToList();
                if (favMatch.Any())
                    db.UserFavorites.RemoveRange(favMatch);

                db.SaveChanges();
            }

            return Json(new { success = true });
        }

        // Fallback used only from the Favourites page, for a favourite whose product
        // is no longer in the live ScrapedItems catalogue (so ToggleFavourite has no
        // id to look up). Removes the favourite directly by its own row id, scoped to
        // the signed-in user so nobody can remove another user's favourite.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult RemoveFavourite(int favoriteId)
        {
            string uid = User.Identity.GetUserId();
            if (string.IsNullOrEmpty(uid))
                return Json(new { success = false, message = "Please log in to manage favourites." });

            var fav = db.UserFavorites.FirstOrDefault(x => x.favoriteId == favoriteId && x.userId == uid);
            if (fav == null)
                return Json(new { success = false, message = "That favourite was already removed." });

            db.UserFavorites.Remove(fav);
            db.SaveChanges();
            return Json(new { success = true, favourited = false });
        }

        public ActionResult Favourites()
        {
            string mail = User.Identity.Name;
            ViewBag.email = mail;
            ViewBag.lett = mail[0];
            string uid = User.Identity.GetUserId();

            var favs = db.UserFavorites
                .Where(x => x.userId == uid)
                .OrderByDescending(x => x.DateAdded)
                .ToList();

            var dislikes = db.UserDislikes
                .Where(x => x.userId == uid)
                .OrderByDescending(x => x.DateAdded)
                .ToList();

            // Match each favourite back to its live ScrapedItems row (by product name +
            // store) so the heart button on this page can call the very same
            // ToggleFavourite(id) endpoint the Main catalogue page uses. Some favourites
            // may no longer have a live match (product re-scraped under a different name,
            // gone from a store, etc.) - those fall back to RemoveFavourite instead.
            var scrapedLookup = db.ScrapedItems
                .AsNoTracking()
                .ToList()
                .GroupBy(s => (s.Title ?? "").Trim() + "|" + (s.Retailer ?? "").Trim(), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

            var model = new FavouritesViewModel
            {
                Items = favs.Select(f =>
                {
                    ScrapedItems match;
                    scrapedLookup.TryGetValue((f.productname ?? "").Trim() + "|" + (f.store ?? "").Trim(), out match);

                    return new FavouriteCardItem
                    {
                        FavoriteId = f.favoriteId,
                        ScrapedItemId = match != null ? (int?)match.Id : null,
                        Title = f.productname,
                        Price = !string.IsNullOrEmpty(f.price)
                            ? f.price
                            : (match != null ? match.Price.ToString("0.00", CultureInfo.InvariantCulture) : "0.00"),
                        Retailer = f.store,
                        ImageUrl = !string.IsNullOrWhiteSpace(f.image) ? f.image : (match != null ? match.ImageUrl : null)
                    };
                }).ToList(),
                Dislikes = dislikes.Select(d =>
                {
                    ScrapedItems match;
                    scrapedLookup.TryGetValue((d.productname ?? "").Trim() + "|" + (d.store ?? "").Trim(), out match);

                    return new DislikedCardItem
                    {
                        DislikedItemId = d.DislikedItemId,
                        ScrapedItemId = match != null ? (int?)match.Id : null,
                        Title = d.productname,
                        Price = !string.IsNullOrEmpty(d.price)
                            ? d.price
                            : (match != null ? match.Price.ToString("0.00", CultureInfo.InvariantCulture) : "0.00"),
                        Retailer = d.store,
                        ImageUrl = !string.IsNullOrWhiteSpace(d.image) ? d.image : (match != null ? match.ImageUrl : null)
                    };
                }).ToList()
            };

            return View(model);
        }

        // Removes a disliked entry directly by its own row id, scoped to the signed-in
        // user, so the product is eligible to show up in the catalogue again. Mirrors
        // RemoveFavourite - no need to look the product up in ScrapedItems since we're
        // just deleting the dislike row itself.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult RemoveDislike(int dislikedItemId)
        {
            string uid = User.Identity.GetUserId();
            if (string.IsNullOrEmpty(uid))
                return Json(new { success = false, message = "Please log in to manage hidden products." });

            var disliked = db.UserDislikes.FirstOrDefault(x => x.DislikedItemId == dislikedItemId && x.userId == uid);
            if (disliked == null)
                return Json(new { success = false, message = "That item was already removed." });

            db.UserDislikes.Remove(disliked);
            db.SaveChanges();
            return Json(new { success = true });
        }

        //Akon-Hold my hand.
        public async Task<ActionResult> Playwright()
        {
            var scraper = new Scraper();

            await scraper.RunFruits();
            await scraper.RunMeat();
            await scraper.RunRice();
            await scraper.RunVegetables();
            await scraper.RunSnacks();

            return Content("Playwright worked!");
        }

        public async Task<ActionResult> WPlaywright()
        {
            var scraper = new WScraper();

            await scraper.RunFruits();
            await scraper.RunMeat();
            await scraper.RunRice();
            await scraper.RunVegetables();
            await scraper.RunSnacks();

            return Content("Playwright worked!");
        }

        public async Task<ActionResult> CPlaywright()
        {
            var scraper = new CScraper();

            await scraper.RunFruits();
            await scraper.RunMeat();
            await scraper.RunRice();
            await scraper.RunVegetables();
            await scraper.RunSnacks();

            return Content("Playwright worked!");
        }

        public async Task<ActionResult> APW()
        {
            var scraper = new Scraper();
            var wScraper = new WScraper();
            var cScraper = new CScraper();

            // Pick n Pay
            await scraper.RunFruits();
            await scraper.RunMeat();
            await scraper.RunRice();
            await scraper.RunVegetables();
            await scraper.RunSnacks();

            // Woolworths
            await wScraper.RunFruits();
            await wScraper.RunMeat();
            await wScraper.RunRice();
            await wScraper.RunVegetables();
            await wScraper.RunSnacks();

            // Checkers
            await cScraper.RunFruits();
            await cScraper.RunMeat();
            await cScraper.RunRice();
            await cScraper.RunVegetables();
            await cScraper.RunSnacks();

            return Content("All stores scraped successfully!");
        }


        //nuthing but a G thang
        [HttpPost]
        public async Task<ActionResult> DownloadShoppingListPdf(ShoppingListPdfModel model)
        {
            model.Date = DateTime.Now;

            var document = new ShoppingListPdfDocument(model);

            byte[] pdfBytes = document.GeneratePdf();

            // Also stash a copy in Supabase Storage + BudgetHistory, for signed-in users only.
            // Never let a Supabase hiccup stop the download itself - errors are swallowed
            // inside SaveToBudgetHistoryAsync.
            if (User?.Identity?.IsAuthenticated == true)
            {
                string uid = User.Identity.GetUserId();
                await SaveToBudgetHistoryAsync(uid, pdfBytes);
            }

            return File(
                pdfBytes,
                "application/pdf",
                "SmartSpend-Shopping-List.pdf"
            );
        }

        // Uploads the exported PDF to the Supabase Storage bucket configured in Web.config
        // (path: "{userId}/{filename}") and records the resulting URL in BudgetHistory so it
        // can be listed on the History page. Any failure (bad keys, network, db) is logged and
        // swallowed - a broken cloud save should never break the user's download.
        private async Task SaveToBudgetHistoryAsync(string uid, byte[] pdfBytes)
        {
            var filename = $"SmartSpend-Shopping-List-{DateTime.UtcNow:yyyyMMdd-HHmmssfff}.pdf";

            try
            {
                var storage = new SupabaseStorageService();
                var fileUrl = await storage.UploadAsync($"{uid}/{filename}", pdfBytes, "application/pdf");

                if (string.IsNullOrEmpty(fileUrl))
                    return; // upload failed - already logged inside SupabaseStorageService

                db.BudgetHistory.Add(new BudgetHistory
                {
                    userId = uid,
                    filename = filename,
                    DateExported = DateTime.Now,
                    fileUrl = fileUrl
                });
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("BudgetHistory save to Supabase failed: " + ex);
            }
        }



        // ---------------------------------------------------------------
        // AI recommendation helpers
        // ---------------------------------------------------------------

        // Keep token usage low: candidates per category x categories.
        // 3 per category = 15 candidates (12 for vegetarians, meat is skipped).
        private const int CandidatesPerCategory = 3;
        private const int MaxFavouritesForAI = 5;
        private const int MaxRecommendations = 10;

        private static readonly string[] AICategories = { "Fruits", "Meat", "Rice", "Vegetables", "Snacks" };

        // The model sometimes "recommends" a product just to say it was excluded.
        // Any reason that reads like a rejection is dropped server-side.
        private static readonly string[] RejectionWords = { "exclud", "conflict", "not suitable", "unsuitable", "avoid" };

        public class AIRecommendationCard
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Category { get; set; }
            public string Price { get; set; }
            public string Store { get; set; }
            public string ImageUrl { get; set; }
            public string Reason { get; set; }
            public bool IsFavourite { get; set; }
        }

        public class AIRecommendationResult
        {
            public bool Fallback { get; set; }
            public List<AIRecommendationCard> Items { get; set; } = new List<AIRecommendationCard>();
        }

        private GroqService CreateGroqService()
        {
            var apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
                apiKey = ConfigurationManager.AppSettings["GroqApiKey"];
            return new GroqService(apiKey);
        }

        // Browser key for Google Maps Platform (it ends up in page JavaScript, so it must be
        // restricted by HTTP referrer + API in the Google Cloud console). Prefer Web.config:
        //   <add key="GoogleMapsApiKey" value="..." />
        // The fallback is the same key Views/UserPreferences/Create.cshtml already uses.
        private static string GetMapsApiKey()
        {
            var key = ConfigurationManager.AppSettings["GoogleMapsApiKey"];
            return string.IsNullOrWhiteSpace(key)
                ? "AIzaSyAMwVtOUI3bvh-ilrxRpkQvfv9O5IV6kDk"
                : key;
        }

        // Categories that can never suit this diet - not even sent to the model (saves tokens too).
        private static HashSet<string> CategoriesToSkip(string dietaryNeeds)
        {
            var skip = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (!string.IsNullOrWhiteSpace(dietaryNeeds) &&
                (dietaryNeeds.IndexOf("vegetarian", StringComparison.OrdinalIgnoreCase) >= 0 ||
                 dietaryNeeds.IndexOf("vegan", StringComparison.OrdinalIgnoreCase) >= 0))
            {
                skip.Add("Meat");
            }

            return skip;
        }

        private List<ScrapedItems> GetRandomCandidates(string userId, ICollection<string> skipCategories = null, DietaryProfile dietary = null)
        {
            // Products this user has explicitly disliked
            var dislikedKeys = new HashSet<string>(
                db.UserDislikes
                    .Where(d => d.userId == userId)
                    .Select(d => new { d.productname, d.store })
                    .ToList()
                    .Select(d => MainViewModel.FavKey(d.productname, d.store))
            );

            var candidates = new List<ScrapedItems>();

            foreach (var category in AICategories)
            {
                if (skipCategories != null && skipCategories.Contains(category))
                    continue;

                var items = db.ScrapedItems
                    .AsNoTracking()
                    .Where(x => x.Category == category)
                    .OrderBy(x => Guid.NewGuid())
                    .ToList()
                    .Where(x => !dislikedKeys.Contains(
                        MainViewModel.FavKey(x.Title, x.Retailer)
                    ))
                    // Dietary needs and allergies are hard filters: never recommend a product that conflicts.
                    .Where(x => dietary == null || !DietaryFilterService.ShouldHide(dietary, x.Title, x.Category, x.DietaryTags, x.DietaryChecked))
                    .Take(CandidatesPerCategory)
                    .ToList();

                candidates.AddRange(items);
            }

            return candidates;
        }

        // Loads preferences + favourites, picks a fresh random candidate pool and
        // packages it all for the AI. One place, so every endpoint sends the same shape.
        private AIUserContext BuildAIContext(string uid, out List<ScrapedItems> candidates)
        {
            var preferences = db.UserPreferences
                .AsNoTracking()
                .FirstOrDefault(x => x.UserId == uid);

            candidates = GetRandomCandidates(uid, CategoriesToSkip(preferences?.DietaryNeeds),
                DietaryProfile.From(preferences?.DietaryNeeds, preferences?.Allergies));

            // Most recent favourites only - the prompt uses just a few, so don't load them all.
            var favourites = db.UserFavorites
                .AsNoTracking()
                .Where(x => x.userId == uid)
                .OrderByDescending(x => x.DateAdded)
                .Take(MaxFavouritesForAI)
                .ToList();

            return new AIUserContext
            {
                DietaryNeeds = preferences?.DietaryNeeds,
                Allergies = preferences?.Allergies,
                ProductStyle = preferences?.ProductStyle,
                CookingStyle = preferences?.CookingStyle,
                Lifestyle = preferences?.Lifestyle,
                ShoppingFrequency = preferences?.ShoppingFrequency,

                Favourites = favourites.Select(x => new AIProduct
                {
                    Name = x.productname,
                    Price = x.price,
                    Store = x.store
                }).ToList(),

                Candidates = candidates.Select(x => new AIProduct
                {
                    Id = x.Id,
                    Name = x.Title,
                    Category = x.Category,
                    Price = x.Price.ToString("0.00", CultureInfo.InvariantCulture),
                    Store = x.Retailer
                }).ToList()
            };
        }

        private static bool LooksLikeRejection(string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
                return false;

            return RejectionWords.Any(w => reason.IndexOf(w, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        private static AIRecommendationCard ToCard(ScrapedItems p, string reason, HashSet<string> favKeys)
        {
            return new AIRecommendationCard
            {
                Id = p.Id,
                Name = p.Title,
                Category = p.Category,
                Price = p.Price.ToString("0.00", CultureInfo.InvariantCulture),
                Store = p.Retailer,
                ImageUrl = p.ImageUrl,
                Reason = reason,
                IsFavourite = favKeys.Contains(MainViewModel.FavKey(p.Title, p.Retailer))
            };
        }

        private async Task<AIRecommendationResult> GetAIRecommendationsAsync(string uid)
        {
            var result = new AIRecommendationResult();

            List<ScrapedItems> candidates;
            var context = BuildAIContext(uid, out candidates);

            if (candidates.Count == 0)
                return result;

            var groq = CreateGroqService();
            var prompt = groq.BuildRecommendationPrompt(context);

            // null means the call failed (rate limit, network, truncated reply...)
            var raw = await groq.GetResponse(prompt);
            var aiRecommendations = groq.ParseRecommendations(raw);

            // Candidates are already in memory, so no second database query is needed.
            var products = candidates.ToDictionary(x => x.Id);

            var valid = aiRecommendations
                .Where(x => products.ContainsKey(x.ItemId) && !LooksLikeRejection(x.Reason))
                .GroupBy(x => x.ItemId)              // the model occasionally repeats an id
                .Select(g => g.First())
                .Take(MaxRecommendations)
                .ToList();

            var favKeys = new HashSet<string>(
                db.UserFavorites
                    .AsNoTracking()
                    .Where(f => f.userId == uid)
                    .Select(f => new { f.productname, f.store })
                    .ToList()
                    .Select(f => MainViewModel.FavKey(f.productname, f.store)));

            if (valid.Count == 0)
            {
                // AI failed or returned nothing usable: plain candidates, no reasons.
                result.Fallback = true;
                result.Items = candidates
                    .Take(MaxRecommendations)
                    .Select(p => ToCard(p, null, favKeys))
                    .ToList();
                return result;
            }

            result.Items = valid
                .Select(x => ToCard(products[x.ItemId], x.Reason, favKeys))
                .ToList();

            return result;
        }

        // Called by the Main page (on load and when "Reload suggestions" is clicked).
        [HttpGet]
        [Authorize]
        public async Task<JsonResult> GetAIRecommendations()
        {
            Response.Cache.SetCacheability(HttpCacheability.NoCache);

            string uid = User.Identity.GetUserId();
            var result = await GetAIRecommendationsAsync(uid);

            return Json(
                new { success = true, fallback = result.Fallback, items = result.Items },
                JsonRequestBehavior.AllowGet
            );
        }

        // Works out dietary tags for any scraped product that doesn't have them yet. Scraping does
        // this automatically; use this once after adding the columns (existing products have no tags),
        // or any time the AI was unavailable. Progress is saved as it goes - if it says products
        // remain, just open it again.
        [Authorize]
        public async Task<ActionResult> TagDietary()
        {
            int tagged = await DietaryFilterService.TagUncheckedAsync();

            int remaining = db.ScrapedItems
                .Where(x => !x.DietaryChecked)
                .ToList()
                .Count(x => DietaryFilterService.IsCheckedCategory(x.Category));

            return Content(
                "Tagged " + tagged + " products this run. " +
                (remaining == 0 ? "All checked products are tagged." : remaining + " still to tag - open this page again."),
                "text/plain");
        }

        // ---------------------------------------------------------------
        // Test endpoints
        // ---------------------------------------------------------------

        [HttpGet]
        [Authorize]
        public JsonResult TestCandidates()
        {
            string uid = User.Identity.GetUserId();

            var candidates = GetRandomCandidates(uid);

            return Json(
                candidates.Select(x => new
                {
                    Id = x.Id,
                    Name = x.Title,
                    Category = x.Category,
                    Price = x.Price,
                    Store = x.Retailer
                }),
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpGet]
        [Authorize]
        public JsonResult TestAIContext()
        {
            string uid = User.Identity.GetUserId();

            List<ScrapedItems> candidates;
            var context = BuildAIContext(uid, out candidates);

            return Json(
                context,
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult> TestGroq()
        {
            var groq = CreateGroqService();

            var result = await groq.GetResponse("Respond with a JSON object: {\"status\":\"SUCCESS\"}");

            if (result == null)
                return Content("Groq call failed - check the Debug output for the error.", "text/plain");

            return Content(result, "application/json");
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult> TestAIRecommendation()
        {
            string uid = User.Identity.GetUserId();
            var result = await GetAIRecommendationsAsync(uid);

            if (result.Fallback)
                Response.AddHeader("X-AI-Fallback", "true");

            return Json(
                result.Items,
                JsonRequestBehavior.AllowGet
            );
        }

        // Export history page: every PDF this user has exported, newest first.
        [Authorize]
        public ActionResult History()
        {
            string mail = User.Identity.Name;
            ViewBag.email = mail;
            ViewBag.lett = mail[0];
            string uid = User.Identity.GetUserId();

            var history = db.BudgetHistory
                .Where(x => x.userId == uid)
                .OrderByDescending(x => x.DateExported)
                .ToList();

            return View(history);
        }

        // Reused for streaming a past export back down as a file, rather than opening a new
        // HttpClient per download.
        private static readonly System.Net.Http.HttpClient historyHttp = new System.Net.Http.HttpClient();

        // Re-fetches a previously-exported PDF from Supabase Storage and streams it back as an
        // attachment, so clicking "Download" on the History page behaves the same as a fresh
        // export. Scoped to fileID + the signed-in user's own userId, so nobody can pull down
        // someone else's export just by guessing an id.
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> DownloadHistoryFile(int id)
        {
            string uid = User.Identity.GetUserId();

            var entry = db.BudgetHistory.FirstOrDefault(x => x.fileID == id && x.userId == uid);
            if (entry == null || string.IsNullOrEmpty(entry.fileUrl))
                return new HttpStatusCodeResult(404, "That export could not be found.");

            byte[] pdfBytes;
            try
            {
                pdfBytes = await historyHttp.GetByteArrayAsync(entry.fileUrl);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("History download fetch failed: " + ex);
                return new HttpStatusCodeResult(502, "Could not retrieve that file right now.");
            }

            return File(
                pdfBytes,
                "application/pdf",
                string.IsNullOrWhiteSpace(entry.filename) ? "SmartSpend-Shopping-List.pdf" : entry.filename
            );
        }
    }
}
