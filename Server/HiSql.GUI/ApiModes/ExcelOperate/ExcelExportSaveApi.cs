using System;
using System.Collections.Generic;
using System.Data;

namespace HiSql.GUI.ApiModes.ExcelOperate {
    public class SheetConfig {

        /// <summary>
        /// Sheet名字
        /// </summary>
        public string SheetName { get; set; }

        /// <summary>
        /// 表头所在行
        /// </summary>
        public int HeadRowNumber { get; set; }

        /// <summary>
        /// 数据源表
        /// </summary>
        public string RefTableName { get; set; }

        /// <summary>
        /// 表头数据列映射
        /// </summary>
        public Dictionary<string, string> HeaderColumnMap { get; set; }
    }

    /// <summary>
    /// 保存Excel模板导出配置
    /// </summary>
    public class ExcelExportSaveRequest {
        public string Id { get; set; }
        /// <summary>
        /// 模板所在位置
        /// </summary>
        public string ExcelUrl { get; set; }

        /// <summary>
        /// Sheet映射
        /// </summary>
        public List<SheetConfig> Sheets { get; set; }

    }

    /// <summary>
    /// 模板导出配置响应
    /// </summary>
    public class ExcelExportSaveResponse {
        public bool IsOk { get; set; }
    }
}