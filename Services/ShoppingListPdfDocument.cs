using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartSpend.Models;

namespace SmartSpend.Services
{
    public class ShoppingListPdfDocument : IDocument
    {
        private readonly ShoppingListPdfModel _model;

        public ShoppingListPdfDocument(ShoppingListPdfModel model)
        {
            _model = model;
        }

        public DocumentMetadata GetMetadata()
        {
            return DocumentMetadata.Default;
        }

        public DocumentSettings GetSettings()
        {
            return DocumentSettings.Default;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);

                // Use Lato throughout the PDF
                page.DefaultTextStyle(x => x.FontFamily("Lato"));

                // Header
                page.Header()
                    .AlignCenter()
                    .Column(header =>
                    {
                        // Logo
                        header.Item()
                            .AlignCenter()
                            .Height(55)
                            .Image(
                                System.Web.Hosting.HostingEnvironment.MapPath(
                                    "~/Content/img/wallet.png"
                                )
                            )
                            .FitHeight();

                        // Header text
                        header.Item()
                            .PaddingTop(5)
                            .Text("My SmartSpend Shopping List")
                            .FontFamily("Lato")
                            .FontSize(20)
                            .Bold()
                            .AlignCenter();
                    });

                page.Content()
                    .PaddingTop(15)
                    .Column(column =>
                    {
                        column.Spacing(10);

                        // Budget information
                        column.Item()
                            .Text($"Budget: R{_model.Budget:0.00}")
                            .FontSize(11);

                        column.Item()
                            .Text($"Date: {_model.Date:dd MMMM yyyy}")
                            .FontSize(11);

                        // Stores
                        foreach (var store in _model.Stores)
                        {
                            ComposeStore(column, store);
                        }

                        // Final totals
                        column.Item()
                            .BorderTop(1)
                            .PaddingTop(8)
                            .Column(total =>
                            {
                                total.Item()
                                    .Text(
                                        $"Total True Cost: R{_model.TotalTrueCost:0.00}"
                                    )
                                    .FontSize(12)
                                    .Bold();

                                total.Item()
                                    .Text(
                                        $"Remaining Budget: R{_model.RemainingBudget:0.00}"
                                    )
                                    .FontSize(12)
                                    .Bold();
                            });
                    });

                page.Footer()
                    .AlignCenter()
                    .Text("SmartSpend")
                    .FontFamily("Lato")
                    .FontSize(9);
            });
        }

        private void ComposeStore(
            ColumnDescriptor column,
            ShoppingListStoreModel store)
        {
            column.Item()
                .Background(Colors.Grey.Lighten3)
                .Padding(8)
                .Column(storeColumn =>
                {
                    // Store name
                    storeColumn.Item()
                        .Text(store.StoreName)
                        .FontFamily("Lato")
                        .FontSize(15)
                        .Bold();

                    // Store address
                    if (!string.IsNullOrWhiteSpace(store.Address))
                    {
                        storeColumn.Item()
                            .Text(store.Address)
                            .FontFamily("Lato")
                            .FontSize(9);

                        storeColumn.Item()
                            .PaddingTop(5)
                            .LineHorizontal(1);
                    }

                    // Items
                    foreach (var item in store.Items)
                    {
                        var lineTotal = item.Price * item.Quantity;

                        storeColumn.Item()
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .Text(item.Name)
                                    .FontFamily("Lato")
                                    .FontSize(10);

                                row.ConstantItem(35)
                                    .AlignRight()
                                    .Text($"x{item.Quantity}")
                                    .FontFamily("Lato")
                                    .FontSize(10);

                                row.ConstantItem(70)
                                    .AlignRight()
                                    .Text($"R{item.Price:0.00} ea")
                                    .FontFamily("Lato")
                                    .FontSize(9)
                                    .FontColor(Colors.Grey.Darken1);

                                row.ConstantItem(70)
                                    .AlignRight()
                                    .Text($"R{lineTotal:0.00}")
                                    .FontFamily("Lato")
                                    .FontSize(10)
                                    .Bold();
                            });
                    }

                    // Subtotal
                    storeColumn.Item()
                        .PaddingTop(6)
                        .Text($"Subtotal: R{store.Subtotal:0.00}")
                        .FontFamily("Lato")
                        .FontSize(10)
                        .Bold();

                    // Transport
                    storeColumn.Item()
                        .Text(
                            $"Transport: {store.TransportMethod} " +
                            $"(R{store.TransportCost:0.00})"
                        )
                        .FontFamily("Lato")
                        .FontSize(10);

                    // True cost
                    storeColumn.Item()
                        .Text($"True Cost: R{store.TrueCost:0.00}")
                        .FontFamily("Lato")
                        .FontSize(10)
                        .Bold();
                });
        }
    }
}