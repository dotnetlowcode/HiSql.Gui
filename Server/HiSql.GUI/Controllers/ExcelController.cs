using HiSql.GUI.ApiModes.ExcelOperate;
using HiSql.GUI.Framework;
using HiSql.GUI.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Controllers
{

    [ServiceFilter(typeof(WebAuthority))]
    public class ExcelController : ControllerBase
    {
        ExcelService Service;
        public ExcelController(ExcelService _service)
        {
            Service = _service;
        }


        [Route("hidata/api/excel/upload")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<ExcelExportFileUploadResponse>> Upload(IFormFile file)
        {
            ExcelExportFileUploadResponse resp = await Service.SaveUploadExcel(file);
            return ApiResultModel.Success(resp);
        }


        [Route("hidata/api/excel/getUpExcelInfo")]
        [HttpPost]
        [EnableCors("HiDataCors")]
        public async Task<ApiResultModel<ExcelExportFileUploadResponse>> GetUpExcelInfo([FromBody] ExcelExportFileUploadRequest req)
        {
            ExcelExportFileUploadResponse resp = await Service.GetUpExcelInfo(req.UrlPath);
            return ApiResultModel.Success(resp);
        }


    }
}
