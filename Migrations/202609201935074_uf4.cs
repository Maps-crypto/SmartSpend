namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class uf4 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.UserFavorites", "image", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.UserFavorites", "image");
        }
    }
}
