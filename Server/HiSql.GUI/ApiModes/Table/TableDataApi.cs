using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{

    public class TableDataRequest
    {

        public string TableName { get; set; }

        /// <summary>
        /// 查询的表字段
        /// </summary>
        public string Fields { get; set; }

        public int PageSize { get; set; } = 10;

        public int PageIndex { get; set; } = 1;

        /// <summary>
        /// 排序字段
        /// </summary>
        public string OrderByField { get; set; }


        /// <summary>
        /// 查询条件
        /// </summary>
        public JObject WhereJson { get; set; }


        /// <summary>
        /// hiSqlWhere条件SQL
        /// </summary>

        public string HiSqlWhere { get; set; }

        /// <summary>
        /// hiSqlWhere条件参数
        /// </summary>
        public Dictionary<string, object> HiSqlWhereParam { get; set; }

    }

    public class TableDataResponse
    {

   

        public List<ExpandoObject> List { get; set; }

        public int TotalCount { get; set; }

        public int PageIndex { get;  set; }
    }
}
