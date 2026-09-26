using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class UserFavorites
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int favoriteId {  get; set; }
        public string userId { get; set; }
        public string productname { get; set; }
        public string price {  get; set; }        
        public string store {  get; set; }
        public string image { get; set; }
        public DateTime DateAdded { get; set; }
    }
}