using HiSql.GUI.Framework;
using HiSql.GUI.Framework.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HiData.Framework.DependencyInjection
{

    public static class DependencyInjectionExtend
    {
        /// <summary>
        /// 添加扫描注入
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        static public IServiceCollection InjecHiData(this IServiceCollection services)
        {
            //延迟注入功能
            services.AddTransient(typeof(Lazy<>), typeof(LazyServiceFactory<>));
            var assemblies = AppDomain.CurrentDomain.GetAssemblies().ToList();
            var regTypes = GetRegByBaseTypes(new List<Type> {
                typeof(ITransient),typeof(ISingleton),typeof(IScoped),typeof(ISelfTransient)
            }, assemblies);
            regTypes.ForEach(r =>
            {
                var interfaces = r.GetTypeInfo().ImplementedInterfaces;
                var classInterface = interfaces.Where(r => r == typeof(ISingleton)).FirstOrDefault();
                if (classInterface != null)
                {
                    services.AddSingleton(r);
                    return;
                }
                classInterface = interfaces.Where(r => r == typeof(ISelfTransient)).FirstOrDefault();
                if (classInterface != null)
                {
                    services.AddTransient(r);
                    return;
                }
                classInterface = interfaces.Where(r => r == typeof(IScoped)).FirstOrDefault();
                if (classInterface != null)
                {
                    services.AddScoped(r);
                    return;
                }
                classInterface = interfaces.Where(r => r != typeof(ITransient)).FirstOrDefault();
                if (classInterface?.IsInterface ?? false)
                {
                    services.AddTransient(classInterface, r);
                }
                services.AddTransient(r);
            });
            return services;
        }


        private static List<Type> GetRegByBaseTypes(List<Type> baseType, List<Assembly> assemblies)
        {
            var allServices = assemblies
                .SelectMany(s => s.GetTypes())
            .Where(p => baseType.Any(k => k.IsAssignableFrom(p) && p != k));
            return allServices.ToList();
        }
    }
}
