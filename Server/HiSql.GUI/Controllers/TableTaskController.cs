using HiSql.GUI.ApiModes.TableTask;
using HiSql.GUI.Framework;
using HiSql.GUI.Services;
using HiSql.GUI.TimeJob;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Controllers
{


    public class TableTaskController : ControllerBase
    {
        TableTaskService Service;

        public TableTaskController(TableTaskService _tableTaskService)
        {
            Service = _tableTaskService;
        }

        /// <summary>
        /// 定时任务保存
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [ServiceFilter(typeof(WebAuthority))]
        [Route("hidata/tableTask/save")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableTaskSaveResponse>> SaveTableTask([FromBody] TableTaskSaveRequest request)
        {
            //request.TableName = tableName;
            TableTaskSaveResponse data = await Service.TableTaskSave(request);
            return ApiResultModel.Success(data);
        }

        /// <summary>
        /// 定时任务删除
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [ServiceFilter(typeof(WebAuthority))]
        [Route("hidata/tableTask/delete")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableTaskDeleteResponse>> SaveTableTask([FromBody] TableTaskDeleteRequest request)
        {
            TableTaskDeleteResponse data = await Service.Delete(request);
            return ApiResultModel.Success(data);
        }





        /// <summary>
        /// 定时任务状态同步
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [ServiceFilter(typeof(WebAuthority))]
        [Route("hidata/tableTask/stateSync")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableTaskStateSyncResponse>> TableTaskStateSync([FromBody] TableTaskStateSyncRequest request)
        {
            TableTaskStateSyncResponse data = await Service.StateSync(request);
            return ApiResultModel.Success(data);
        }


        /// <summary>
        /// 定时导出Excel
        /// </summary>
        /// <returns></returns>
        [Route("hidata/tableTask/excute")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<TableTaskExuteResponse>> TableTaskExcute([FromBody] TableTaskExuteRequest request)
        {
            if (request.RandomKey != TableJob.RandomKey)
            {
                return ApiResultModel.Fail<TableTaskExuteResponse>("无权访问！", 403);
            }
            TableTaskExuteResponse response = await Service.Excute(request);
            return ApiResultModel.Success(response);
        }

    }
}
