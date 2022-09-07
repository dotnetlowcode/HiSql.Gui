using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.DataBase
{
    public class HiApiRequest
    {
        public string ApiId { get; set; }

        public string GroupName { get; set; }

        public string ApiName { get; set; }

        public ExpandoObject Body { get; set; }

    }




    public class BlockResult
    {
        /// <summary>
        /// 查询到数据集合
        /// </summary>
        public List<ExpandoObject> Table { get; set; }

        /// <summary>
        /// 总条数[注意PageIndex=-1时这个字段忽略]
        /// </summary>
        public int TotalCount { get; set; }
    }

    public class HiApiResponse
    {
        public Dictionary<string, BlockResult> Tables { get; set; } = new Dictionary<string, BlockResult>();
    }
}
