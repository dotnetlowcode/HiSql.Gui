using HiSql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{
    public class TableIndexsRequest
    {

    }

    public class TableIndexsResponse
    {
        /// <summary>
        /// 索引集合
        /// </summary>
        public List<TabIndex> List { get; set; }
    }
}
