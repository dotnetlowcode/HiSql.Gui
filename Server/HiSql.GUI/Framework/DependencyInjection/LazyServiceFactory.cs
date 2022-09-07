using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Framework.DependencyInjection
{
    public class LazyServiceFactory<T> : Lazy<T>
    {
        public LazyServiceFactory(IServiceProvider serviceProvider)
            : base(() => serviceProvider.GetService<T>())
        {
        }
    }
}
