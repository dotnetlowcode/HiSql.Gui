using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.Table
{

    /// <summary>
    /// Excel创建表
    /// </summary>
    public class ExcelCreateTableRequest
    {
        /// <summary>
        /// Excel文件
        /// </summary>
        public IFormFile file { get; set; }

        /// <summary>
        /// 表名
        /// </summary>
        public string TableName { get; set; }

        /// <summary>
        /// 表中文名
        /// </summary>
        public string TabDesc { get; set; }
    }


    /// <summary>
    /// 创建表结果c
    /// </summary>
    public class ExcelCreateTableResponse
    {
        /// <summary>
        /// 创建后的表名
        /// </summary>
        public  string TableName { get; set; }
    }
}
