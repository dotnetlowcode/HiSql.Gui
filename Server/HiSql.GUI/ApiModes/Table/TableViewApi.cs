using System;
namespace HiSql.GUI.ApiModes.Table
{
    public class TableViewCreateRequest
    {
        /// <summary>
        /// 创建视图的HiSQL
        /// </summary>
        public string Sql { get; set; }

        /// <summary>
        /// 表名
        /// </summary>
        public string TableName { get; set; }
    }

    public class TableViewCreateResponse
    {
        /// <summary>
        /// 是否创建成功
        /// </summary>
        public bool IsOk { get; set; }
    }
}

