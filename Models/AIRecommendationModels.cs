using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class AIRecommendationModels
    {

    }

    public class AIProduct
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Price { get; set; }
        public string Store { get; set; }

        // Optional: short comma-separated facts you actually have in your database,
        // e.g. "vegetarian,ready-meal,500g". Leave null if you have nothing.
        // Gives the AI real data to base its reasons on instead of guessing from the name.
        public string Tags { get; set; }
    }

    public class AIUserContext
    {
        public string DietaryNeeds { get; set; }
        public string Allergies { get; set; }
        public string ProductStyle { get; set; }
        public string CookingStyle { get; set; }
        public string Lifestyle { get; set; }
        public string ShoppingFrequency { get; set; }

        public List<AIProduct> Favourites { get; set; } = new List<AIProduct>();
        public List<AIProduct> Candidates { get; set; } = new List<AIProduct>();
    }

    public class AIRecommendation
    {
        public int ItemId { get; set; }
        public string Reason { get; set; }
    }

    public class AIRecommendationResponse
    {
        public List<AIRecommendation> Recommendations { get; set; } = new List<AIRecommendation>();
    }
}
