using HiSql.GUI;
using HiSql.GUI.ApiModes.Oauth;
using HiSql.GUI.Framework;
using HiSql.GUI.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HiSql.Gui.WebApi.Controllers
{
    public class OauthController : ControllerBase
    {
        public OauthController(OauthService _service)
        {
            service = _service;
        }

        OauthService service;


        [Route("hidata/oauth/login")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<OauthGetTokenResponse>> GetToken([FromBody]OauthGetTokenRequest request)
        {
            OauthGetTokenResponse resp = await service.GetToken(request);
            return ApiResultModel.Success(resp);
        }

        [Route("hidata/oauth/changePassword")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        [ServiceFilter(typeof(WebAuthority))]
        public async Task<ApiResultModel<ChangePasswordResponse>>ChangePassword([FromBody]ChangePasswordRequest request)
        {
            ChangePasswordResponse resp = await service.ChangePassword(request);
            return ApiResultModel.Success(resp);
        }

    }
}
