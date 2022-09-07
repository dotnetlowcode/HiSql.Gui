using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.Oauth
{
    public class OauthGetTokenRequest
    {
        public string UserName { get; set; }

        public string Password { get; set; }

    }

    public class OauthRefreshTokenRequest
    {
    }



    public class OauthGetTokenResponse
    {
        public string AccessToken { get; set; }

        public string RefreshToken { get; set; }
    }
}
