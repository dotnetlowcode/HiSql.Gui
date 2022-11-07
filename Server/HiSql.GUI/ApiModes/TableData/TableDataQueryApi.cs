using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{

    public class QueryParamBase
    {
        /// <summary>
        /// 查询的表字段
        /// </summary>
        public string? Fields { get; set; }


        /// <summary>
        /// 页大小默认10
        /// </summary>
        public int PageSize { get; set; } = 10;


        /// <summary>
        /// 页码，从1开始
        /// </summary>
        public int PageIndex { get; set; } = 1;

        /// <summary>
        /// 排序字段
        /// </summary>
        public string? OrderByField { get; set; }


        /// <summary>
        /// 查询条件
        /// </summary>
        public JObject? WhereJson { get; set; }


        /// <summary>
        /// hiSqlWhere条件SQL
        /// </summary>

        public string HiSqlWhere { get; set; }

        /// <summary>
        /// hiSqlWhere条件参数
        /// </summary>
        public Dictionary<string, string> HiSqlWhereParam { get; set; }

        /// <summary>
        /// 是否去重
        /// </summary>
        public bool Distinct { get; set; }
    }


    public class TableDataQueryRequest : QueryParamBase
    {
    }


    public class QueryResponseBase
    {
        /// <summary>
        /// 查询到数据集合
        /// </summary>
        public List<ExpandoObject> List { get; set; }

        /// <summary>
        /// 总条数[注意PageIndex=-1时这个字段忽略]
        /// </summary>
        public int TotalCount { get; set; }
    }


    public class TableDataQueryResponse : QueryResponseBase
    {
        public string TableName { get; set; }
    }
}
