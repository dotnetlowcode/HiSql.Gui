using System;
namespace HiSql.GUI.Repository.Models
{
    public class HiExcelTemplateSheetModel
    {
        /// <summary>
        /// SheetName[必填参数]
        /// <summary>
        public string SheetName { get; set; }

        /// <summary>
        /// TemplateId[必填参数]
        /// <summary>
        public string TemplateId { get; set; }

        /// <summary>
        /// SourcesTableName
        /// <summary>
        public string SourcesTableName { get; set; }

        /// <summary>
        /// HeaderRowNumber
        /// <summary>
        public int HeaderRowNumber { get; set; }

        /// <summary>
        /// ModiTime
        /// <summary>
        public DateTime ModiTime { get; set; }

        /// <summary>
        /// ModiName
        /// <summary>
        public string ModiName { get; set; }

        /// <summary>
        /// SortNum
        /// <summary>
        public int SortNum { get; set; }
    }

}

