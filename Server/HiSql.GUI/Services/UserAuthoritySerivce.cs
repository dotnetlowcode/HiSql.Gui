using HiSql.GUI.Helper;
using HiSql.GUI.Repository.HisSqlRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Services
{
    public class UserAuthoritySerivce : ITransient
    {
        HiUserInfoRepository hiUserInfoRepository;

        public UserAuthoritySerivce(HiUserInfoRepository _hiUserInfoRepository)
        {
            hiUserInfoRepository = _hiUserInfoRepository;
        }


        public async Task<string[]> HasAuth(string uId, string[] respIds)
        {
            var userAuthList = await hiUserInfoRepository.GetUserAuths(uId);
            if (userAuthList.Any(r => r.UserRId == UserRoleConfig.SuperAdmin))
            {
                return respIds;
            }
            var resultRespIds = respIds.Intersect(userAuthList.Select(r => r.ResId));
            return resultRespIds.ToArray();
        }



        /// <summary>
        /// 判断用户是否有资源权限
        /// </summary>
        /// <param name="uId">用户Id</param>
        /// <param name="respId">资源Id</param>
        /// <param name="moduleOperateId">操作Id</param>
        /// <returns>是否有权限</returns>
        public async Task<bool> HasAuth(string uId, string respId, string moduleOperateId)
        {
            var userAuthList = await hiUserInfoRepository.GetUserAuths(uId);
            if (userAuthList.Any(r => r.UserRId == UserRoleConfig.SuperAdmin))
            {
                return true;
            }
            var userAuthMap = userAuthList.GroupBy(r => r.ResId).ToDictionary(r => r.Key, r => r.First());
            if (userAuthMap.ContainsKey(respId))
            {
                return userAuthMap[respId].RefValues.IndexOf(moduleOperateId) > -1;
            }
            return false;
        }



    }
}
