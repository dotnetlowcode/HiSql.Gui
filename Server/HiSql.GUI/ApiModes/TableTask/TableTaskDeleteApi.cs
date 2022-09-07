using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableTask
{
    public class TableTaskDeleteRequest
    {
        /// <summary>
        /// 任务Id
        /// </summary>
        public List<string> TaskIds { get; set; }
    }


    public class TableTaskDeleteResponse
    {
        public int DeleteCount { get;  set; }
    }
}
