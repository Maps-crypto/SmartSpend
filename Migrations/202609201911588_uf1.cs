namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class uf1 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.UserFavorites",
                c => new
                    {
                        favoriteId = c.Int(nullable: false, identity: true),
                        userId = c.Int(nullable: false),
                        productname = c.String(),
                        price = c.String(),
                        store = c.String(),
                    })
                .PrimaryKey(t => t.favoriteId);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.UserFavorites");
        }
    }
}
