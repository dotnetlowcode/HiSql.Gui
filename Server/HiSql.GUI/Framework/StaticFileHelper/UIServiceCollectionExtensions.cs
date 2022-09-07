using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace HiSql.WebUI
{
    public static class UIServiceCollectionExtensions
    {
        public static void AddHiSqlDbUI(this IServiceCollection services)
        {
            //
            //services.AddControllersWithViews().AddRazorRuntimeCompilation(options =>
            //{
            //    options.FileProviders.Add(new EmbeddedFileProvider(typeof(HiSql.WebUI.Controllers.DataBaseController).GetType().Assembly));
            //});


            services.ConfigureOptions(typeof(UIConfigureOptions));
        }
    }
}
