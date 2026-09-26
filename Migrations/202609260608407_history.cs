namespace SmartSpend.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class history : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.BudgetHistories",
                c => new
                    {
                        fileID = c.Int(nullable: false, identity: true),
                        userId = c.String(),
                        filename = c.String(),
                        DateExported = c.DateTime(nullable: false),
                        fileUrl = c.String(),
                    })
                .PrimaryKey(t => t.fileID);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.BudgetHistories");
        }
    }
}
