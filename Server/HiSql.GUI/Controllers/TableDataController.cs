using HiSql.GUI.ApiModes;
using HiSql.GUI.ApiModes.TableData;
using HiSql.GUI.Framework;
using HiSql.GUI.Framework.DependencyInjection;
using HiSql.GUI.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Threading.Tasks;

namespace HiSql.Gui.WebApi.Controllers
{

    [ServiceFilter(typeof(WebAuthority))]
    public class TableDataController : ControllerBase
    {

        public TableDataController(TableDataService tableService)
        {
            Service = tableService;
        }

        public TableDataService Service { get; }





        /// <summary>
        /// 事务批量操作
        /// </summary>
        /// <returns></returns>
        [Route("hidata/api/data/tranOperate")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TransactionOperateResponse>> TransactionOperate([FromBody] TransactionOperateRequest request)
        {
            var data = await Service.TransactionOperate(request);
            return ApiResultModel.Success(data);
        }


        /// <summary>
        /// 批量查询
        /// </summary>
        /// <returns></returns>
        [Route("hidata/api/data/batchquery")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<BatchQueryResponse>> BatchQuery([FromBody] BatchQueryRequest request)
        {
            var data = await Service.BatchQuery(request);
            return ApiResultModel.Success(data);
        }



        /// <summary>
        /// 增加数据
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        [Route("hidata/api/data/{tableName}/add")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataAddResponse>> Add([FromRoute] string tableName, [FromBody] TableDataAddRequest? request)
        {
            if (request == null)
            {
                request = new TableDataAddRequest();
            }
            request.TableName = tableName;
            TableDataAddResponse data = await Service.Add(request);
            return ApiResultModel.Success(data);

        }

        /// <summary>
        /// 更新表数据
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        [Route("hidata/api/data/{tableName}/update")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataUpdateResponse>> Update([FromRoute] string tableName, [FromBody] TableDataUpdateRequest body)
        {
            TableDataUpdateResponse data = await Service.Update(tableName, body);
            return ApiResultModel.Success(data);
        }

        /// <summary>
        /// 删除表数据
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        [Route("hidata/api/data/{tableName}/delete")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataDeleteResponse>> Delete([FromRoute] string tableName, [FromBody] TableDataDeleteRequest body)
        {
            TableDataDeleteResponse data = await Service.Delete(tableName, body);
            return ApiResultModel.Success(data);
        }




        /// <summary>
        /// 查询表数据
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        [Route("hidata/api/data/{tableName}/query")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataQueryResponse>> Query([FromRoute] string tableName, [FromBody] TableDataQueryRequest body)
        {
            TableDataQueryResponse data = await Service.Query(tableName, body);
            return ApiResultModel.Success(data);
        }


        /// <summary>
        /// 创建导出任务
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        [Route("hidata/api/data/{tableName}/createExportTask")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataExportResponse>> CreateExportTask([FromRoute] string tableName, [FromBody] TableDataExportRequest body)
        {
            TableDataExportResponse resp = await Service.CreateExportTask(tableName, body);
            return ApiResultModel.Success(resp);
        }

        /// <summary>
        /// 查询任务执行状态
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        [Route("hidata/api/data/checkExportTaskStatus")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<CheckExportTaskStatusResponse>> CheckExportTaskStatus([FromBody] CheckExportTaskStatusRequest request)
        {
            CheckExportTaskStatusResponse resp;
            while (true)
            {
                resp = await Service.CheckExportTaskStatus(request);
                if (resp.List.Count > 0)
                {
                    break;
                }
                await Task.Delay(2000);
            }
            return ApiResultModel.Success(resp);
        }



        [Route("hidata/api/data/{tableName}/excelImport")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableDataImportResponse>> GetUpExcelInfo(IFormFile file, [FromRoute] string tableName)
        {
            var req = new TableDataImportRequest
            {
                file = file,
                TableName = tableName
            };
            TableDataImportResponse resp = await Service.ImportExcelData(req);
            return ApiResultModel.Success(resp);
        }
    }
}
