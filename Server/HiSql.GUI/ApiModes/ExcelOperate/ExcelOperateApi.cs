using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.ExcelOperate
{
    //public class ExcelSimpleSheet
    //{
    //   public string Name { get; set; }
    //    public List<List<string>> TableData { get; set; }
    //}


    public class ExcelExportFileUploadRequest
    {
        public string UrlPath { get; set; }
    }
    public class ExcelExportFileUploadResponse
    {

        public string Path { get; set; }

        public Dictionary<string, string> Sheets { get; set; }
    }

}
