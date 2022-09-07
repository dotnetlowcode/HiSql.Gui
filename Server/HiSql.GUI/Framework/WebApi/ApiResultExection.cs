using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Framework.WebApi
{

    public class ApiResultExection : Exception
    {
        public ApiResultExection(string error, int status = 500, int httpStatusCode = 200)
           : base(error)
        {
            this.Status = status;
            this.HttpStatusCode = httpStatusCode;
        }
        public int Status { get; set; } = 500;

        public int HttpStatusCode { get; set; }=200;
    }
}
