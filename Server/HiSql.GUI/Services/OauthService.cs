using HiSql.GUI.ApiModes.Oauth;
using HiSql.GUI.Helper;
using HiSql.GUI.Repository.HisSqlRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Services
{
    public class OauthService : ServiceBase, ITransient
    {
        IHiUserInfoRepository hiUserInfoRepository;
        HiSqlConfig hiSqlConfig;
        public OauthService(
            IHttpContextAccessor _httpContextAccessor,
            HiSqlClient _hiSqlClient,
            IHiUserInfoRepository _hiUserInfoRepository,
            HiSqlConfig _hiSqlConfig
            )
            : base(_httpContextAccessor, _hiSqlClient)
        {
            hiUserInfoRepository = _hiUserInfoRepository;
            hiSqlConfig = _hiSqlConfig;
        }



        public async Task<OauthGetTokenResponse> GetToken(OauthGetTokenRequest request)
        {
            var loginUser = await hiUserInfoRepository.GetUserInfo(request.UserName);
            if(loginUser == null)
            {
                throw ApiResultModel.ThrowApiExection("用户名或密码错误!");
            }
            var pwdMd5 = EncryptionUtility.EncryptSHA256(request.Password, hiSqlConfig.PwdSalt);
            if (loginUser.Password != pwdMd5)
            {
                throw ApiResultModel.ThrowApiExection("用户名或密码错误!");
            }
            DateTime tonkenExpire = DateTime.Now.AddDays(2);
            var payload = new JwtPlayload
            {
                UserName = loginUser.UserName,
                UId = loginUser.UId,
                TonkenExpire = tonkenExpire,
            };
            var accessToken = EncryptionUtility.DESEncode(payload, hiSqlConfig.DESKey);
            return new OauthGetTokenResponse
            {
                AccessToken = accessToken
            };
        }

        public async Task<ChangePasswordResponse> ChangePassword(ChangePasswordRequest request)
        {
            var loginUser = this.TokenInfo;
            var userInfo = await hiUserInfoRepository.GetUserInfo(loginUser.UserName);
            if (userInfo == null)
            {
                throw ApiResultModel.ThrowApiExection("重新登录后再试试!");
            }
            userInfo.Password = EncryptionUtility.EncryptSHA256(request.NewPassword, hiSqlConfig.PwdSalt);
            var modifyCount = await this.sqlClient.Modi(HiUserInfoRepository.tableName, userInfo).ExecCommandAsync();
            var resp = new ChangePasswordResponse();
            if (modifyCount == 0)
            {
                throw ApiResultModel.ThrowApiExection("密码修改失败!");
            }
            return resp;
        }
    }
}
