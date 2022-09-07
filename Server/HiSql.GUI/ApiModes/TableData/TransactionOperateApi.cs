using HiSql.GUI.ApiModes.DataBase;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableData
{

    public enum TableOperate
    {
        Add = 0,
        Delete = 1,
        Update = 2,
    }


    public class TranOperteItem
    {

        /// <summary>
        /// 操作的表
        /// </summary>
        public string TableName { get; set; }


        /// <summary>
        /// 新增数据集合
        /// </summary>
        public List<ExpandoObject> AddDatas { get; set; }


        /// <summary>
        /// 待更新数据
        /// </summary>
        public ExpandoObject UpdateSet { get; set; }


        /// <summary>
        /// 操作类型
        /// </summary>
        public TableOperate Type { get; set; }

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


    public class TransactionOperateRequest
    {
        /// <summary>
        /// 批量操作
        /// </summary>
        public List<TranOperteItem> Operates { get; set; }

    }

    public class TransactionOperateResponse
    {
        public int AddCount { get; set; } = 0;

        public int UpdateCount { get; set; } = 0;

        public int DeleteCount { get; set; } = 0;

    }
}
