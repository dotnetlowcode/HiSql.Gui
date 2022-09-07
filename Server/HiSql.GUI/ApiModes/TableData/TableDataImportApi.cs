using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableData
{
    public class TableDataImportRequest
    {
        public IFormFile file { get; set; }

        public string TableName { get;  set; }
    }


    public class TableDataImportResponse
    {
        public int UpdateCount { get; set; }

    }
}
