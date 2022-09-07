using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.Models
{
    public class HiTaskLogModel
    {
        /// <summary>
        /// LogId[必填参数]
        /// <summary>
        public string LogId { get; set; }

        /// <summary>
        /// TaskId
        /// <summary>
        public string TaskId { get; set; }

        /// <summary>
        /// 任务状态
        /// <summary>
        public int TaskStatus { get; set; }

        /// <summary>
        /// 执行信息
        /// <summary>
        public string Message { get; set; }

        /// <summary>
        /// 详细信息
        /// <summary>
        public string InnerMessage { get; set; }

        /// <summary>
        /// 创建时间
        /// <summary>
        public DateTime CreateDate { get; set; }

        /// <summary>
        /// 日志级别
        /// <summary>
        public int OpLevel { get; set; }

        /// <summary>
        /// 执行时间
        /// <summary>
        public long ExcuteTime { get; set; }
    }
}
