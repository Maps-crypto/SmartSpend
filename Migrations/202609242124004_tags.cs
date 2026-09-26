namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class tags : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.ScrapedItems", "DietaryTags", c => c.String());
            AddColumn("dbo.ScrapedItems", "DietaryChecked", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.ScrapedItems", "DietaryChecked");
            DropColumn("dbo.ScrapedItems", "DietaryTags");
        }
    }
}
