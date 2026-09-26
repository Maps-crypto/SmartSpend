using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class CategoryGroup
    {
        public string Name { get; set; }
        public List<ScrapedItems> Items { get; set; }

        public CategoryGroup()
        {
            Items = new List<ScrapedItems>();
        }
    }

    public class MainViewModel
    {
        public List<CategoryGroup> Categories { get; set; }

        // Keys built with FavKey(); lets the view check "is this product already a favourite?" in O(1).
        public HashSet<string> FavouriteKeys { get; set; }

        public MainViewModel()
        {
            Categories = new List<CategoryGroup>();
            FavouriteKeys = new HashSet<string>();
        }

        // UserFavorites stores productname + store, so that pair identifies a favourite.
        public static string FavKey(string productName, string store)
        {
            return ((productName ?? "").Trim() + "||" + (store ?? "").Trim()).ToLowerInvariant();
        }
    }
}