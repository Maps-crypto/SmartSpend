namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class dislikes : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.UserDislikeds",
                c => new
                    {
                        DislikedItemId = c.Int(nullable: false, identity: true),
                        userId = c.String(),
                        productname = c.String(),
                        price = c.String(),
                        store = c.String(),
                        image = c.String(),
                        DateAdded = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.DislikedItemId);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.UserDislikeds");
        }
    }
}
