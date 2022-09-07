using System;
using System.Linq;
using System.Threading.Tasks;
using HiData.Framework;
using HiSql;
using HiSql.GUI.Helper;
using HiSql.GUI.Repository.Interface;
using HiSql.GUI.Repository.Models;

namespace HiSql.GUI.Repository.HisSqlRepository {
    public class HiApiRepository : IHiApiRepository, ITransient {
        private readonly HiSqlClient sqlClient;

        public HiApiRepository (HiSqlClient _sqlClient) {
            sqlClient = _sqlClient;
        }

        /// <summary>
        /// Api主体表名
        /// </summary>
        public static readonly string hiApiTableName = "Hi_Api";

        /// <summary>
        /// 执行块
        /// </summary>
        public static readonly string hiApiBlockTableName = "Hi_ApiBlock";

        /// <summary>
        /// Api参数表名
        /// </summary>
        public static readonly string hiApiParamTableName = "Hi_ApiParam";

        public HiApiInfo Get (string id) {
            HiApiInfo info = new HiApiInfo ();
            info.Obj = sqlClient.Query (hiApiTableName).Field ("*").Where (new Filter () { { "ApiId", OperType.EQ, id }
            }).ToList<HiApiModelSimple> ().First ();
            return FillHiApiEntity (info);

        }

        public HiApiInfo Get (string apiName, string groupName) {
            HiApiInfo info = new HiApiInfo ();
            info.Obj = sqlClient.Query (hiApiTableName).Field ("*").Where (new Filter () { { "GroupName", OperType.EQ, groupName }, { "Name", OperType.EQ, apiName },
            }).ToList<HiApiModelSimple> ().First ();
            return FillHiApiEntity (info);
        }

        private HiApiInfo FillHiApiEntity (HiApiInfo info) {
            info.Blocks = sqlClient.Query (hiApiBlockTableName).Field ("*").Where (new Filter () { { "ApiId", OperType.EQ, info.Obj.ApiId }
            }).ToList<HiApiBlockSimpleEntity> ();
            info.Param = sqlClient.Query (hiApiParamTableName).Field ("*").Where (new Filter () { { "ApiId", OperType.EQ, info.Obj.ApiId }, { "FieldType", OperType.EQ, "In" }
            }).ToList<HiApiParamEntitySimple> ();
            return info;
        }
    }
}