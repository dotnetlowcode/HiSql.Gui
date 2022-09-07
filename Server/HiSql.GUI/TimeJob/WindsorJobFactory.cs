using Quartz;
using Quartz.Spi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.TimeJob
{
    public class WindsorJobFactory : IJobFactory
    {
        private readonly IServiceProvider _container;

        public WindsorJobFactory(IServiceProvider container)
        {
            _container = container;
        }

        public IJob NewJob(TriggerFiredBundle bundle)
        {
            return (IJob)_container.GetService(bundle.JobDetail.JobType);
        }

        public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
        {
            return (IJob)_container.GetService(bundle.JobDetail.JobType);
        }

        public void ReturnJob(IJob job)
        {
        }
    }
}
