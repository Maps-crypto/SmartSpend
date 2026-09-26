using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using QuestPDF.Drawing;
using QuestPDF.Infrastructure;

namespace SmartSpend
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            QuestPDF.Settings.License = LicenseType.Community;

            // Embed the font instead of relying on a system font being installed on
            // the server (Arial/Lato are frequently missing on Linux/App Service/
            // container hosts, which is what caused DocumentDrawingException).
            FontManager.RegisterFont(File.OpenRead(Server.MapPath("~/App_Data/Fonts/Roboto-Regular.ttf")));
            FontManager.RegisterFont(File.OpenRead(Server.MapPath("~/App_Data/Fonts/Roboto-Bold.ttf")));

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}