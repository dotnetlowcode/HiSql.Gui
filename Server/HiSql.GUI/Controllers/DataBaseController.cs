using HiSql.GUI;
using HiSql.GUI.ApiModes.DataBase;
using HiSql.GUI.ApiModes.Oauth;
using HiSql.GUI.ApiModes.Table;
using HiSql.GUI.Framework;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Dynamic;
using System.Threading.Tasks;

namespace HiSql.Gui.WebApi.Controllers
{

    [ServiceFilter(typeof(WebAuthority))]
    public class DataBaseController : ControllerBase
    {


        public DataBaseController(DataBaseService tableService)
        {
            this.Service = tableService;
        }

        public DataBaseService Service { get; }


        /// <summary>
        /// 获取数据库基础表或者视图
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("hidata/database/tables")]
        [HttpPost, HttpGet]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<GetTablesResponse>> GetTables([FromBody] GetTablesRequest request)
        {
            GetTablesResponse resp = await Service.GetTables(request);
            return ApiResultModel.Success(resp);
        }


        [Route("hidata/database/apiTestExcute")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<ApiTestExcuteResponse>> ApiTestExcute([FromBody] ApiTestExcuteRequest request)
        {
            var tokenInfo = this.Request.HttpContext.Items["TokenInfo"] as JwtPlayload;

            ApiTestExcuteResponse result = await Service.ApiTestExcute(request, tokenInfo);
            return ApiResultModel.Success(result);
        }

        [Route("hidata/hiApi/{groupName}/{apiName}")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<HiApiResponse>> HiApiExcute([FromRoute] string groupName, [FromRoute] string apiName, [FromBody] ExpandoObject body)
        {
            var tokenInfo = this.Request.HttpContext.Items["TokenInfo"] as JwtPlayload;
            HiApiResponse result = await Service.HiApiExcute(new HiApiRequest
            {
                ApiName = apiName,
                GroupName = groupName,
                Body = body
            }, tokenInfo);
            return ApiResultModel.Success(result);
        }

        [Route("hidata/hiApi/{id}")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<HiApiResponse>> HiApiExcute([FromRoute] string id, [FromBody] ExpandoObject body)
        {
            var tokenInfo = this.Request.HttpContext.Items["TokenInfo"] as JwtPlayload;
            HiApiResponse result = await Service.HiApiExcute(new HiApiRequest
            {
                ApiId = id,
                Body = body
            }, tokenInfo);
            return ApiResultModel.Success(result);
        }


        [Route("hidata/version")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<DataBaseVersionResponse>> GetDBVersion([FromBody] DataBaseVersionRequest request)
        {
            DataBaseVersionResponse resp = await Service.GetDBVersion(request);
            return ApiResultModel.Success(resp);
        }


    }
}
