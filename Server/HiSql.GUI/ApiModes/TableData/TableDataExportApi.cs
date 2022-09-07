using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableData
{
    public class TableDataExportRequest : QueryParamBase
    {
        public bool IsNullTemplate { get; set; }
    }

    public class TableDataExportResponse
    {
        public string TaskId { get; set; }

        public string DowloadUrl { get; set; }
    }
}
