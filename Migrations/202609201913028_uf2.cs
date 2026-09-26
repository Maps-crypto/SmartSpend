namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class uf2 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.UserFavorites", "DateAdded", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.UserFavorites", "DateAdded");
        }
    }
}
