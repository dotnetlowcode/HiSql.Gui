using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.DataBase
{
    public class SnowflakeIdApiRequest
    {
        public int Count { get; set; } = 1;
    }

    public class SnowflakeIdApiResponse
    {
        public List<long> SnowflakeIds { get; set; }
    }
}
