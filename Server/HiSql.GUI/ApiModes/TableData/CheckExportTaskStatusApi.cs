using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableData
{
    public class CheckExportTaskStatusRequest
    {
        public List<string> TaskIds { get; set; }

        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime? LastUpdateTime { get; set; }
    }

    public class TaskInfoModel
    {

        public string TaskId { get; set; }

        /// <summary>
        /// 任务状态
        /// </summary>
        public int Status { get; set; }

        /// <summary>
        /// 任务结果
        /// </summary>
        public string Result { get; set; }

        /// <summary>
        /// 更新时间
        /// </summary>
        public DateTime UpdateTime { get;  set; }
    }

    public class CheckExportTaskStatusResponse
    {
        public List<TaskInfoModel> List { get; set; }=new List<TaskInfoModel>();
    }
}
