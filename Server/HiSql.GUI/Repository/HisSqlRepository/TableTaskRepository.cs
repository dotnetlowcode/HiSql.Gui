using HiSql.GUI.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.HisSqlRepository
{
    public class TableTaskRepository : ITableTaskRepository, ITransient
    {
        HiSqlClient hiSqlClient;

        /// <summary>
        /// 任务日志
        /// </summary>
        public const string TableTaskLogTableName = "Hi_Task_Log";

        /// <summary>
        /// 任务表
        /// </summary>
        public const string TableTask = "Hi_Task";

        /// <summary>
        /// 队列任务
        /// </summary>
        public const string QueueTask = "Hi_QueueTask";

        public TableTaskRepository(HiSqlClient _hiSqlClient)
        {
            hiSqlClient = _hiSqlClient;
        }





        /// <summary>
        /// 添加任务执行日志
        /// </summary>
        /// <param name="taskId">任务Id</param>
        /// <param name="message">日志信息</param>
        /// <param name="taskStatus">任务状态</param>
        /// <param name="innerMessage">日志详细信息</param>
        /// <param name="excuteTime">任务执行时间</param>
        /// <param name="opLevel">操作级别</param>
        /// <returns></returns>
        public async Task<bool> AddLog(string taskId, string message, int taskStatus, string innerMessage = "", long excuteTime = 0, int opLevel = 0)
        {
            var logObj = new HiTaskLogModel()
            {
                CreateDate = DateTime.Now,
                LogId = HiSql.Snowflake.NextId().ToString(),
                ExcuteTime = excuteTime,
                Message = message,
                InnerMessage = innerMessage,
                OpLevel = opLevel,
                TaskId = taskId,
                TaskStatus = taskStatus
            };
            var addCount = await hiSqlClient.Insert(TableTaskLogTableName, logObj).ExecCommandAsync();
            return addCount > 0;
        }



        /// <summary>
        /// 保存一个队列任务
        /// </summary>
        /// <param name="queueTask"></param>
        /// <returns></returns>
        public async Task<bool> SaveQueueTask(QueueTaskModel queueTask)
        {
            var addCount = await hiSqlClient.Insert(QueueTask, queueTask).ExecCommandAsync();
            return addCount > 0;
        }




        public async Task<List<QueueTaskModel>> Gets(string[] taskIds)
        {
            return hiSqlClient.Query(QueueTask).Where(new Filter {
              { "TaskId", OperType.IN,taskIds },
            }).ToList<QueueTaskModel>();
        }


        /// <summary>
        /// 更新任务状态
        /// </summary>
        /// <param name="taskId">任务Id</param>
        /// <param name="currentStatus">当前状态</param>
        /// <param name="status">设置的状态</param>
        /// <returns>是否更新成功</returns>
        public async Task<bool> UpdateQueueTaskState(string taskId, int currentStatus, int status)
        {
            var updateResult = await hiSqlClient.Update(QueueTask).Set(new
            {
                Status = status,
            }).Where(new Filter {
                { "TaskId", OperType.EQ,taskId },
                { "Status", OperType.EQ,currentStatus }
            }).ExecCommandAsync();
            return updateResult > 0;
        }



        /// <summary>
        /// 保存任务结果
        /// </summary>
        /// <param name="taskId">任务Id</param>
        /// <param name="status">设置的状态</param>
        /// <param name="result">任务运行结果</param>
        /// <returns>是否更新成功</returns>
        public async Task<bool> CompulateQueueTask(string taskId, int status, object result)
        {
            var updateResult = await hiSqlClient.Update(QueueTask).Set(new
            {
                Status = status,
                Result = Newtonsoft.Json.JsonConvert.SerializeObject(result),
                UpdateTime = DateTime.Now,
            }).Where(new Filter {
                { "TaskId", OperType.EQ,taskId },
            }).ExecCommandAsync();
            return updateResult > 0;
        }

    }
}
