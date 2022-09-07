using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.DataBase
{
    public class DataBaseVersionRequest
    {
    }

    public class DataBaseVersionResponse
    {
        public string Version { get; set; }

        public string VersionDesc { get; set; }
    }
}
