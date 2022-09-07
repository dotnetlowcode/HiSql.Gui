using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.Models
{
    public class TableTaskModel
    {

        /// <summary>
        /// 任务Id[必填参数]
        /// <summary>
        public string TaskId { get; set; }

        /// <summary>
        /// 任务执行周期
        /// <summary>
        public string Cron { get; set; }

        /// <summary>
        /// Title
        /// <summary>
        public string Title { get; set; }

        /// <summary>
        /// 任务类型
        /// <summary>
        public string Type { get; set; }

        /// <summary>
        /// SQL
        /// <summary>
        public string SQL { get; set; }

        /// <summary>
        /// APIUrl
        /// <summary>
        public string APIUrl { get; set; }

        /// <summary>
        /// 任务完成后通知地址
        /// </summary>
        public string EventUrl { get; set; }

        /// <summary>
        /// 任务状态 0关闭，1开启
        /// <summary>
        public int Status { get; set; }

        /// <summary>
        /// CreateTime 
        /// <summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// UpdateTime
        /// <summary>
        public DateTime UpdateTime { get; set; }

        /// <summary>
        /// StoreName
        /// <summary>
        public string StoreName { get; set; }

        /// <summary>
        ///  StoreType  类型: NewCreate|MergeCreate|ReCreate
        /// </summary>
        public string StoreType { get; set; }

        /// <summary>
        /// 表名后缀
        /// </summary>
        public string SotreFormat { get; set; }

        /// <summary>
        /// Excel导出任务Id
        /// </summary>
        public string TemplateId { get; set; }


    }
}
