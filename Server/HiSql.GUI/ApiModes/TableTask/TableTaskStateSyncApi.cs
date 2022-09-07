using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableTask
{
    public class TableTaskStateSyncRequest
    {
        public List<string> TaskIds { get; set; }
    }


    public class TableTaskStateSyncResponse
    {
         public int UpdateCount { get; set; }

        public int DeleteCount { get; set; }
    }
}
