using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.Oauth
{
    public class JwtPlayload
    {   
        public string UId { get;  set; }

        public string UserName { get; set; }

        public DateTime TonkenExpire { get; set; }

        public Dictionary<string, string> UserData { get; set; }

    }
}
