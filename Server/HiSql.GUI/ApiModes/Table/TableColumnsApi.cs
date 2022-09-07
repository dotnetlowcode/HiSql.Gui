using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes {
    public class TableGetColumnsRequest {
        [Required]
        public string TableName { get; set; }
    }

    public class TableGetColumnsResponse {
        public List<ExpandoObject> TabColumnStruct { get; set; }
    }

}