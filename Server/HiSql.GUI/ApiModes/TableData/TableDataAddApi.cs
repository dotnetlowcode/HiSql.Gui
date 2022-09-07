using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes
{
    public class TableDataAddRequest
    {
        public string TableName { get; set; }

        public List<ExpandoObject> Datas { get; set; }

    }


    public class TableDataAddResponse
    {
        public int AddCount { get; set; }
    }
}
