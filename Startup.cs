using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SmartSpend.Startup))]
namespace SmartSpend
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
