using System.Threading.Tasks;
using HiSql.GUI.ApiModes;
using HiSql.GUI.ApiModes.Table;
using HiSql.GUI.Framework;
using HiSql.GUI.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace HiSql.Gui.WebApi.Controllers
{

    [ServiceFilter(typeof(WebAuthority))]
    public class TableController : ControllerBase
    {
        public TableController(TableService tableService)
        {
            this.Service = tableService;
        }

        public TableService Service { get; }

        /// <summary>
        /// 获取表基本结构信息
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        [Route("hidata/table/{tableName}/get")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<object>> Get(string tableName)
        {
            var data = await Service.GetTableInfo(tableName);
            return ApiResultModel.Success(data);
        }

        /// <summary>
        /// 获取表列信息
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("hidata/table/{tableName}/getColumns")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<object>> getColumns([FromRoute] TableGetColumnsRequest param)
        {
            var data = await Service.GetTableColumns(param);
            return ApiResultModel.Success(data);
        }

        /// <summary>
        /// 获取表数据
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("hidata/table/{tableName}/data")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataResponse>> Data([FromBody] TableDataRequest request)
        {
            var data = await Service.GetTableData(request);
            return ApiResultModel.Success(data);
        }


        /// <summary>
        /// 保存表结构信息
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("hidata/table/{tableName}/save")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<SaveTableResponse>> SaveTableInfo([FromRoute] string tableName, [FromBody] SaveTableInfoRequest request)
        {
            request.TableName = tableName;
            var data = await Service.SaveTableInfo(request);
            return ApiResultModel.Success(data);
        }

        /// <summary>
        /// 删除数据
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("hidata/table/{tableName}/delete")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<object>> Delete([FromRoute, FromBody, FromQuery, FromForm] TableDeleteRequest request)
        {
            var data = await Service.Delete(request);
            return ApiResultModel.Success(data);
        }

        /// <summary>
        /// 获取表的索引
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        [Route("hidata/table/{tableName}/indexs")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableIndexsResponse>> Indexs([FromRoute] string tableName)
        {
            var data = await Service.GetIndexs(tableName);
            return ApiResultModel.Success(data);
        }

        [Route("hidata/table/{tableName}/index/delete")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableIndexDeleteResponse>> DeleteIndex([FromRoute] string tableName, [FromBody] TableIndexDeleteRequest request)
        {
            request.TableName = tableName;
            TableIndexDeleteResponse data = await Service.DeleteIndex(request);
            return ApiResultModel.Success(data);
        }

        [Route("hidata/table/{tableName}/index/create")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableIndexCreateResponse>> CreateIndex([FromRoute] string tableName, [FromBody] TableIndexCreateRequest request)
        {
            request.TableName = tableName;
            TableIndexCreateResponse data = await Service.CreateIndex(request);
            return ApiResultModel.Success(data);
        }

        [Route("hidata/tableView/{tableName}/create")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableViewCreateResponse>> CreatreView([FromRoute] string tableName, [FromBody] TableViewCreateRequest request)
        {
            request.TableName = tableName;
            TableViewCreateResponse data = await Service.CreateViewTable(request);
            return ApiResultModel.Success(data);
        }


    }
}