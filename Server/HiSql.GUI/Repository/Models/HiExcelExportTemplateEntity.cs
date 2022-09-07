using System;
namespace HiSql.GUI.Repository.Models
{
    public class HiExcelExportTemplateEntity
    {
        /// <summary>
        /// 导出任务标题
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// TemplateId[必填参数]
        /// <summary>
        public string TemplateId { get; set; }

        /// <summary>
        /// FileUrl
        /// <summary>
        public string FileUrl { get; set; }

        /// <summary>
        /// ModiName
        /// <summary>
        public string ModiName { get; set; }

        /// <summary>
        /// SortNum
        /// <summary>
        public int SortNum { get; set; }

        /// <summary>
        /// ModiTime
        /// <summary>
        public DateTime ModiTime { get; set; }

    }
}

