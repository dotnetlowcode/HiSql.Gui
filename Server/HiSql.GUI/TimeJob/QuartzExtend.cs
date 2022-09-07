using Quartz;
using Quartz.Impl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dasync.Collections;
using HiSql.GUI.Framework.DependencyInjection;
using Quartz.Spi;
using Microsoft.Extensions.DependencyInjection;
using HiSql.GUI.Services;
using HiSql.GUI.Repository.Models;

namespace HiSql.GUI.TimeJob
{
    public class QuartzExtend : ISingleton
    {
        public StdSchedulerFactory Factory { get; private set; }

        readonly IServiceProvider service;

        IScheduler scheduler;

        public QuartzExtend(IServiceProvider _service)
        {
            Factory = new StdSchedulerFactory();
            service = _service;
            InitTask().ConfigureAwait(false).GetAwaiter().GetResult();
        }



        /// <summary>
        /// 初始化系统任务
        /// </summary>
        /// <param name="tableTaskList"></param>
        /// <returns></returns>
        public async Task InitTask()
        {
            HiSqlClient sqlClient = service.GetRequiredService<HiSqlClient>();
            var taskList = sqlClient.Query(TableTaskService.TableName).Field("*").Where(new Filter
            {
                { "Status" , OperType.EQ , 1 }
            }).ToList<TableTaskModel>();
            if (scheduler == null)
            {
                await InitJobIocFactory();
                await scheduler.Start();
            }
            await taskList.ParallelForEachAsync(async task =>
           {
               await SaveTableTask(task);
           }, 1);
        }

        private async Task InitJobIocFactory()
        {
            IJobFactory jobFactory = new WindsorJobFactory(service);
            scheduler = await Factory.GetScheduler();
            scheduler.JobFactory = jobFactory;
        }

        /// <summary>
        /// 添加表格任务
        /// </summary>
        /// <param name="tableTask"></param>
        /// <returns>是更新成功</returns>
        public async Task<bool> SaveTableTask(TableTaskModel tableTask)
        {
            var jobKey = new JobKey($"job:{tableTask.TaskId}");
            var triggerKey = new TriggerKey($"trigger:{tableTask.TaskId}");
            await RemoveTableTask(tableTask.TaskId);
            if (tableTask.Status != 1)
            {
                //如果状态不对就终止执行
                return false;
            }
            var jobData = new JobDataMap();
            jobData[TableJob.InfoKey] = tableTask;
            //任务
            IJobDetail job = JobBuilder.Create<TableJob>()
                  .WithIdentity(jobKey)
                  .UsingJobData(jobData)
                  .Build();

            //触发器
            ITrigger trigger = TriggerBuilder.Create()
               .WithIdentity(triggerKey)
               .WithCronSchedule(tableTask.Cron)
               .Build();

            //关联触发器和任务
            await scheduler.ScheduleJob(job, trigger);
            return true;
        }


        public async Task RemoveTableTask(string taskId)
        {
            var jobKey = new JobKey($"job:{taskId}");
            if (await scheduler.CheckExists(jobKey))
            {
                var triggerKey = new TriggerKey($"trigger:{taskId}");
                await scheduler.UnscheduleJob(triggerKey);
                await scheduler.DeleteJob(jobKey);
            }
        }

    }
}
