using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.Models
{

    public class QueueTaskModel
    {
        /// <summary>
        /// TaskId[必填参数]
        /// <summary>
        public string TaskId { get; set; }

        /// <summary>
        /// CreateTime
        /// <summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// UpdateTime
        /// <summary>
        public DateTime UpdateTime { get; set; }

        /// <summary>
        /// TaskType
        /// <summary>
        public int TaskType { get; set; }

        /// <summary>
        /// Status 0[未处理],1[处理中],2[已完成]
        /// <summary>
        public int Status { get; set; }

        /// <summary>
        /// Params
        /// <summary>
        public string Params { get; set; }

        /// <summary>
        /// Result
        /// <summary>
        public string Result { get; set; }
    }
}
