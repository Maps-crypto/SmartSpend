namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class valtags : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.UserPreferences", "Address", c => c.String(nullable: false));
            AlterColumn("dbo.UserPreferences", "ShoppingFrequency", c => c.String(nullable: false));
            AlterColumn("dbo.UserPreferences", "DietaryNeeds", c => c.String(nullable: false));
            AlterColumn("dbo.UserPreferences", "Allergies", c => c.String(nullable: false));
            AlterColumn("dbo.UserPreferences", "ProductStyle", c => c.String(nullable: false));
            AlterColumn("dbo.UserPreferences", "CookingStyle", c => c.String(nullable: false));
            AlterColumn("dbo.UserPreferences", "Lifestyle", c => c.String(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.UserPreferences", "Lifestyle", c => c.String());
            AlterColumn("dbo.UserPreferences", "CookingStyle", c => c.String());
            AlterColumn("dbo.UserPreferences", "ProductStyle", c => c.String());
            AlterColumn("dbo.UserPreferences", "Allergies", c => c.String());
            AlterColumn("dbo.UserPreferences", "DietaryNeeds", c => c.String());
            AlterColumn("dbo.UserPreferences", "ShoppingFrequency", c => c.String());
            AlterColumn("dbo.UserPreferences", "Address", c => c.String());
        }
    }
}
