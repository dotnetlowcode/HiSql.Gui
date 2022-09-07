using HiSql.GUI.Repository.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.HisSqlRepository
{
    public interface ITableTaskRepository
    {
        Task<bool> AddLog(string taskId, string message, int taskStatus, string innerMessage = "", long excuteTime = 0, int opLevel = 0);

        Task<bool> CompulateQueueTask(string taskId, int status, object result);
        
        Task<List<QueueTaskModel>> Gets(string[] taskIds);
        
        Task<bool> SaveQueueTask(QueueTaskModel queueTask);

        Task<bool> UpdateQueueTaskState(string taskId, int currentStatus, int status);
    }
}