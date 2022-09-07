using HiSql.GUI.ApiModes.Oauth;
using HiSql.GUI.Framework.DependencyInjection;
using HiSql.GUI.Helper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Framework
{
    public class WebAuthority : ActionFilterAttribute, IScoped
    {
        readonly HiSqlConfig hiSqlConfig;

        public WebAuthority(HiSqlConfig _hiSqlConfig)
        {
            hiSqlConfig = _hiSqlConfig;
        }


        public override async Task OnActionExecutionAsync(ActionExecutingContext actionContext, ActionExecutionDelegate next)
        {
            var token = actionContext.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(token))
            {
                AccessDenied(actionContext);
                return;
            }
            var tokenInfo = EncryptionUtility.DESDecodeToEntity<JwtPlayload>(token, hiSqlConfig.DESKey);
            if (tokenInfo.TonkenExpire < DateTime.Now)
            {
                AccessDenied(actionContext);
                return;
            }

            actionContext.HttpContext.Items.Add("TokenInfo", tokenInfo);
            await next();
        }

        private static void AccessDenied(ActionExecutingContext actionContext)
        {
            actionContext.Result = new JsonResult(ApiResultModel.Fail<object>("未授权无法访问!"))
            {
                StatusCode = 403
            };
        }
    }
}
