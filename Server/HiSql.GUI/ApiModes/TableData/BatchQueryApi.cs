using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableData
{

    public class QueryParamItem : QueryParamBase
    {
        public string TableName { get; set; }
    }

    public class BatchQueryRequest
    {
        public List<QueryParamItem> Querys { get; set; }
    }

    public class BatchQueryResponse
    {
        public List<TableDataQueryResponse> Tables { get; set; } = new List<TableDataQueryResponse>(2);
    }
}
