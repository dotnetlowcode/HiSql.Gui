using HiSql.GUI.ApiModes.Oauth;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Services
{
    public class ServiceBase
    {
        protected HiSqlClient sqlClient;

        public ServiceBase(IHttpContextAccessor httpContextAccessor, HiSqlClient hiSqlClient)
        {
            sqlClient = hiSqlClient;
            this.HttpContext = httpContextAccessor.HttpContext;
        }
        public HttpContext HttpContext { get; }

        JwtPlayload? _tokenInfo;
        protected JwtPlayload TokenInfo
        {
            get
            {
                if (_tokenInfo == null)
                {
                    _tokenInfo = HttpContext.Items["TokenInfo"] as JwtPlayload;
                    sqlClient.CurrentConnectionConfig.User = _tokenInfo.UserName;
                }
                return _tokenInfo;
            }
        }

    }
}
