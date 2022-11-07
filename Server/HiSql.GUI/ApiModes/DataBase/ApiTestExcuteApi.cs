using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.DataBase
{
    public class ApiTestExcuteRequest
    {
        public string HiSql { get; set; }

        public Dictionary<string, string> Params { get; set; }

        public int PageSize { get; set; }

        public int PageIndex { get; set; }

        public string? OrderByField { get; set; }


        /// <summary>
        /// hiSqlWhere条件SQL
        /// </summary>

        public string HiSqlWhere { get; set; }

        /// <summary>
        /// hiSqlWhere条件参数
        /// </summary>
        public Dictionary<string, object> HiSqlWhereParam { get; set; }

    }

    public class ApiTestExcuteResponse
    {
        /// <summary>
        /// 查询到数据集合
        /// </summary>
        public List<ExpandoObject> List { get; set; }

        /// <summary>
        /// 结果健值
        /// </summary>
        public string ResultKey { get; set; }

        /// <summary>
        /// 总条数[注意PageIndex=-1时这个字段忽略]
        /// </summary>
        public int TotalCount { get; set; }
    }


}
