using HiSql;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.Gui.WebApi.Helper
{

    public static class HiSqlSetup
    {
        public static IServiceCollection AddHiSqlSetup(this IServiceCollection services)
        {
            services.AddTransient<HiSqlClient, HiSqlClientIOC>();
            return services;
        }
    }

}
