namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class up1 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.UserPreferences",
                c => new
                    {
                        UserPreferencesId = c.Int(nullable: false, identity: true),
                        UserId = c.String(),
                        Address = c.String(),
                        ShoppingFrequency = c.String(),
                        DietaryNeeds = c.String(),
                        Allergies = c.String(),
                        ProductStyle = c.String(),
                        CookingStyle = c.String(),
                        Lifestyle = c.String(),
                        Notifications = c.String(),
                    })
                .PrimaryKey(t => t.UserPreferencesId);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.UserPreferences");
        }
    }
}
