using HiSql.GUI.ApiModes.DataBase;
using HiSql;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{
    public class TableIndexCreateRequest
    {
        /// <summary>
        /// 要操作的表名
        /// </summary>
        public string TableName { get; set; }


        /// <summary>
        /// 索引名
        /// </summary>
        public string IndexName { get; set; }


        /// <summary>
        /// 索引列集合
        /// </summary>
        public List<JObject> Columns { get; set; }
    }

    public class TableIndexCreateResponse : DataBaseResponse
    {

    }
}
