using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Framework.DependencyInjection
{

    /// <summary>
    /// 策略注入实例获取
    /// </summary>
    public class StrategyResolver
    {
        private readonly IServiceProvider container;

        public StrategyResolver(IServiceProvider _container)
        {
            this.container = _container;
        }

        public T? Resolve<T>(string namedStrategy) where T : class
        {
            var type = Assembly.GetAssembly(typeof(T))?.GetType(namedStrategy);
            return this.container.GetService(type) as T;
        }
    }
}
