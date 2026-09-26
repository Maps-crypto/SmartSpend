namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class items : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ScrapedItems",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Title = c.String(),
                        Price = c.Decimal(nullable: false, precision: 18, scale: 2),
                        ImageUrl = c.String(),
                        Retailer = c.String(),
                        Category = c.String(),
                        Availability = c.String(),
                        ProductURL = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.ScrapedItems");
        }
    }
}
