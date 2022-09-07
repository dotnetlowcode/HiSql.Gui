using HiSql.GUI.Framework.WebApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper
{
    public class GuiExceptionMiddleware
    {

        /// <summary>
        /// 保存下一个中间件
        /// </summary>
        private readonly RequestDelegate _next;

        public GuiExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next.Invoke(context);
            }
            catch (ApiResultExection ex)
            {
                var obj = ApiResultModel.Fail<string>(ex.Message, ex.Status);
                await SendExection(context, obj, ex.HttpStatusCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                var obj = ApiResultModel.Fail<string>(ex.Message, 500);
                await SendExection(context, obj);
            }

        }

        static async Task SendExection<T>(HttpContext context, ApiResultModel<T> obj, int httpStatusCode = 200)
        {
            context.Response.ContentType = "application/json;charset=utf-8";
            context.Response.StatusCode = httpStatusCode;
            await context.Response.WriteAsync(Newtonsoft.Json.JsonConvert.SerializeObject(obj));
        }
    }
}
