using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{
    public class TableDataUpdateRequest
    {

        /// <summary>
        /// 要更新的字段
        /// </summary>
        public ExpandoObject UpdateSet { get; set; }


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

    }


    public class TableDataUpdateResponse
    {
        /// <summary>
        /// 修改的数据行数
        /// </summary>
        public int ModifyCount { get; set; }
    }
}
