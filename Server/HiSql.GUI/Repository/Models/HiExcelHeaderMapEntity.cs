using System;
namespace HiSql.GUI.Repository.Models
{
    public class HiExcelHeaderMapEntity
    {

        /// <summary>
        /// MapId[必填参数]
        /// <summary>
        public string MapId { get; set; }

        /// <summary>
        /// TemplateId
        /// <summary>
        public string TemplateId { get; set; }

        /// <summary>
        /// SheetName
        /// <summary>
        public string SheetName { get; set; }

        /// <summary>
        /// HeadName
        /// <summary>
        public string HeadName { get; set; }

        /// <summary>
        /// FieldName
        /// <summary>
        public string FieldName { get; set; }

    }
}

