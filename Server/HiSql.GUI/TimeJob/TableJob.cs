using HiSql.GUI.ApiModes.TableTask;
using HiSql.GUI.Framework.DependencyInjection;
using HiSql.GUI.Helper;
using HiSql.GUI.Repository.HisSqlRepository;
using HiSql.GUI.Repository.Models;
using HiSql.GUI.Services;
using Microsoft.Extensions.Logging;
using Quartz;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace HiSql.GUI.TimeJob
{
    public class TableJob : IJob, ISelfTransient
    {
        HiSqlConfig hiSqlConfig;
        public TableJob(HiSqlConfig _hiSqlConfig)
        {
            hiSqlConfig = _hiSqlConfig;
        }

        public const string InfoKey = "InfoData";

        public static readonly string RandomKey = new Random().Next(int.MaxValue).ToString();

        public async Task Execute(IJobExecutionContext context)
        {
            var taskInfo = context.JobDetail.JobDataMap.Get(InfoKey) as TableTaskModel;
            if (taskInfo == null)
            {
                //任务不存在
                return;
            }
            var resp = await HttpClientHelper.PostData($"{hiSqlConfig.SiteUrl}/hidata/tableTask/excute", new TableTaskExuteRequest
            {
                TaskId = taskInfo.TaskId,
                RandomKey = RandomKey
            });
            Console.WriteLine(resp);
        }

    }
}
