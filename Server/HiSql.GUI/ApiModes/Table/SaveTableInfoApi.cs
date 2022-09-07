using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HiSql.GUI.ApiModes.DataBase;
using Newtonsoft.Json.Linq;

namespace HiSql.GUI.ApiModes
{
    public class SaveTableInfoRequest
    {
        public string TableName { get; set; }

        /// <summary>
        /// 表属性集合
        /// </summary>
        public List<JObject>? TabColumnStruct { get; set; }

        /// <summary>
        /// 表属性
        /// </summary>
        public JObject TabProps { get; set; }

        /// <summary>
        /// 保存动作操作级别
        /// </summary>
        public int OPLevel { get; set; }

        /// <summary>
        /// 是否是视图
        /// </summary>
        public bool IsView { get; set; }

    }

    /// <summary>
    /// 保存表格响应信息
    /// </summary>
    public class SaveTableResponse : DataBaseResponse { }
}