using HiSql.GUI.Framework.WebApi;
using HiSql.GUI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.NodeServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Controllers
{
    public class HomeController : ControllerBase
    {
        INodeServices nodeService;
        HiSqlClient hiSqlClient;
        public HomeController(INodeServices _nodeService, HiSqlClient hiSqlClient)
        {
            nodeService = _nodeService;
            this.hiSqlClient = hiSqlClient;
        }


        [Route("home/index")]
        [HttpGet]
        public async Task<ApiResultModel<string>> Index()
        {
            this.hiSqlClient.CodeFirst.InstallHisql();
            return ApiResultModel.Success("OK");
        }

        [Route("home/test")]
        [HttpGet]
        public async Task<object> Test()
        {
            //var w = await nodeService.InvokeAsync<string>(AppContext.BaseDirectory + "/js/index.js", Newtonsoft.Json.JsonConvert.SerializeObject(new
            //{
            //    Name = "KKK"
            //}));
            //
            // await TableService.CreateTable(hiSqlClient, "退款管理", @"C:\Users\cw\Downloads\退款管理_.xlsx");
            throw new ApiResultExection("一个故意的异常!", 300, 403);
        }


    }
}
