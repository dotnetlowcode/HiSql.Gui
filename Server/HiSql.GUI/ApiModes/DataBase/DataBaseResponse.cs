using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.DataBase
{
    public class DataBaseResponse
    {
        /// <summary>
        /// 是否已执行
        /// </summary>        
        public bool IsOk { get; set; }


        /// <summary>
        /// 准备执行的SQL
        /// </summary>
        public string Sql { get; internal set; }


        /// <summary>
        /// 执行反馈消息
        /// </summary>
        public string Message { get; set; }
    }
}
