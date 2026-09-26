using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class UserPreferences
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserPreferencesId { get; set; }
        public string UserId { get; set; }

        [Required(ErrorMessage = "Please enter your address.")]
        public string Address { get; set; }

        [Required(ErrorMessage = "Please select a shopping frequency.")]
        public string ShoppingFrequency { get; set; }

        [Required(ErrorMessage = "Please select at least one dietary option.")]
        public string DietaryNeeds { get; set; }

        [Required(ErrorMessage = "Please select at least one allergy option (or None).")]
        public string Allergies { get; set; }

        [Required(ErrorMessage = "Please select a product style.")]
        public string ProductStyle { get; set; }

        [Required(ErrorMessage = "Please select at least one cooking style.")]
        public string CookingStyle { get; set; }

        [Required(ErrorMessage = "Please select at least one hobby/lifestyle option.")]
        public string Lifestyle { get; set; }

        public string Notifications { get; set; }
    }
}