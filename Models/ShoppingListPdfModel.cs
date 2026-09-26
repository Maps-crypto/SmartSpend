using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class ShoppingListPdfModel
    {
        public decimal Budget { get; set; }

        public DateTime Date { get; set; }

        public List<ShoppingListStoreModel> Stores { get; set; }

        public decimal TotalTrueCost { get; set; }

        public decimal RemainingBudget { get; set; }
    }

    public class ShoppingListStoreModel
    {
        public string StoreName { get; set; }

        public string Address { get; set; }

        public List<ShoppingListItemModel> Items { get; set; }

        public decimal Subtotal { get; set; }

        public string TransportMethod { get; set; }

        public decimal TransportCost { get; set; }

        public decimal TrueCost { get; set; }
    }

    public class ShoppingListItemModel
    {
        public string Name { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; } = 1;
    }
}