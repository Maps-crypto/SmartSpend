using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace SmartSpend.Models
{
    public class BudgetHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int fileID { get; set; }

        public string userId { get; set; }

        public string filename { get; set; }

        public DateTime DateExported { get; set; }
        public string fileUrl { get; set; }
    }
}