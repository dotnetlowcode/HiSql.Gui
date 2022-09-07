using HiSql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.Table
{
    public class GetTablesRequest
    {
        /// <summary>
        /// 表类型，0表，1视图
        /// </summary>
        public int Type { get; set; }
    }

    public class GetTablesResponse
    {
        public List<TableInfo> List { get; internal set; }
    }
}
