using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class FavouriteCardItem
    {
        // UserFavorites.favoriteId - used by the RemoveFavourite fallback.
        public int FavoriteId { get; set; }

        // ScrapedItems.Id, when this product is still in the live catalogue.
        // Null if the scraper no longer has a matching product (renamed/out of
        // stock/etc.) - in that case the fallback endpoint is used instead.
        public int? ScrapedItemId { get; set; }

        public string Title { get; set; }
        public string Price { get; set; }
        public string Retailer { get; set; }
        public string ImageUrl { get; set; }
    }

    public class DislikedCardItem
    {
        // UserDisliked.DislikedItemId - used to remove the dislike directly.
        public int DislikedItemId { get; set; }

        // ScrapedItems.Id, when this product is still in the live catalogue.
        // Not currently used for removal (removal is always by DislikedItemId),
        // kept for parity with FavouriteCardItem in case it's needed later.
        public int? ScrapedItemId { get; set; }

        public string Title { get; set; }
        public string Price { get; set; }
        public string Retailer { get; set; }
        public string ImageUrl { get; set; }
    }

    public class FavouritesViewModel
    {
        public List<FavouriteCardItem> Items { get; set; } = new List<FavouriteCardItem>();
        public List<DislikedCardItem> Dislikes { get; set; } = new List<DislikedCardItem>();
    }
}