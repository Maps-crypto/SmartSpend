namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class uf3 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.UserFavorites", "userId", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.UserFavorites", "userId", c => c.Int(nullable: false));
        }
    }
}
