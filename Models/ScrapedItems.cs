using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class ScrapedItems
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public string Retailer { get; set; }
        public string Category { get; set; }
        public string Availability { get; set; }
        public string ProductURL { get; set; }

        // Dietary info, filled in after scraping (see DietaryFilterService.TagUncheckedAsync).
        // Comma-separated list of what the product contains or commonly contains, e.g. "dairy,gluten".
        // Possible tags: meat, pork, fish, shellfish, dairy, lactosefree, egg, gluten, nuts, animal.
        public string DietaryTags { get; set; }

        // False until the product has been tagged. Checked-but-empty tags means "nothing to flag".
        public bool DietaryChecked { get; set; }
    }
}