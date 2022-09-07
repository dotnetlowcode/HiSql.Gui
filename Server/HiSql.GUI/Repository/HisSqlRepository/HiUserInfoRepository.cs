using HiSql.GUI.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.HisSqlRepository
{
    public class HiUserInfoRepository : ITransient, IHiUserInfoRepository
    {

        HiSqlClient sqlClient;

       public static  string tableName = "Hi_UserInfo";

        string viewTableName = "Hi_vw_UserAuth";

        public HiUserInfoRepository(HiSqlClient _sqlClient)
        {
            sqlClient = _sqlClient;
        }

        public async Task<HiUserInfoModel> GetUserInfo(string userName)
        {
            var userInfo = sqlClient.Query(tableName).Field("*").Where(new Filter {
             { "UserName",OperType.EQ,userName},
            }).ToList<HiUserInfoModel>().FirstOrDefault();
            return userInfo;
        }

        /// <summary>
        /// 获取用户权限集合
        /// </summary>
        /// <param name="uId"></param>
        /// <returns></returns>
        public async Task<List<HiUserAuthModel>> GetUserAuths(string uId)
        {
            return sqlClient.Query(viewTableName).Field("MId", "RefValues", "ResId", "UserRId").Where(new Filter {
               { "UId",OperType.EQ,uId}
            }).ToList<HiUserAuthModel>();
        }
    }
}
