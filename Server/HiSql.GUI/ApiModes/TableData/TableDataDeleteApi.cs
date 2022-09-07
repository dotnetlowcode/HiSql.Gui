using HiSql.GUI.ApiModes.DataBase;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{
    public class TableDataDeleteRequest
    {
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
        /// 是否清空表
        /// </summary>

        public bool IsClearTable { get; set; }= false;

    }


    public class TableDataDeleteResponse : DataBaseResponse
    {
        /// <summary>
        /// 修改的数据行数
        /// </summary>
        public int DeleteCount { get; set; }
    }
}
