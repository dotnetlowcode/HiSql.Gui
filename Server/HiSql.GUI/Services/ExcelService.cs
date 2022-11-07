using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using HiSql.GUI.ApiModes.ExcelOperate;
using HiSql.GUI.Repository.HisSqlRepository;
using HiSql.GUI.Repository.Models;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Dasync.Collections;
using System.Linq;
using System.Data;
using HiSql.GUI.Helper;

namespace HiSql.GUI.Services
{
    public class ExcelService : ServiceBase, ITransient
    {
        HiSqlConfig hiSqlConfig;

        public ExcelService(IHttpContextAccessor httpContextAccessor, HiSqlClient _sqlClient, HiSqlConfig hiSqlConfig)
            : base(httpContextAccessor, _sqlClient)
        {
            this.hiSqlConfig = hiSqlConfig;
        }

        /// <summary>
        /// 保存并读取Excel模板数据
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public async Task<ExcelExportFileUploadResponse> SaveUploadExcel(IFormFile file)
        {
            var fileName = file.FileName;
            var path = GetSavePath(fileName);
            var savePath = AppContext.BaseDirectory + path;
            var dirPath = Path.GetDirectoryName(savePath);
            if (dirPath != null && !Directory.Exists(dirPath))
            {
                Directory.CreateDirectory(dirPath);
            }
            using (Stream stream = new FileStream(savePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return await GetUpExcelInfo(path);
        }

        public async Task<ExcelExportFileUploadResponse> GetUpExcelInfo(string urlPath)
        {
            var excel = new Extension.Excel(new Extension.ExcelOptions()
            {
                TempType = Extension.TempType.HEADER,
                DataBeginRow = 0,
                HeaderRow = 1
            });
            //excel.ReaderExcel(savePath, r =>
            //{
            //    var table = new ExcelSimpleSheet();
            //    return table;
            //});
            var filePath = AppContext.BaseDirectory + urlPath;
            var sheetNames = excel.GetExcelSheetNames(filePath);
            if (sheetNames == null)
            {
                throw new Exception("Excel读取失败！");
            }
            var sheetMap = new Dictionary<string, string>();
            foreach (var sheetName in sheetNames)
            {
                var dt = excel.ExcelToDataTable(filePath, false, sheetName: sheetName, 10);
                sheetMap[sheetName] = JsonConvert.SerializeObject(dt);
            }
            return new ExcelExportFileUploadResponse
            {
                Path = urlPath,
                Sheets = sheetMap
            };
        }


        /// <summary>
        /// 生成模板Excel保存路径
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        private static string GetSavePath(string fileName)
        {
            return $"/dowload/excelTemplate/{fileName}";
        }

        public async Task<ExcelExportSaveResponse> SaveExportExcel(ExcelExportSaveRequest request)
        {
            var excelTemplateObj = new HiExcelExportTemplateEntity()
            {
                TemplateId = Snowflake.NextId().ToString(),
                FileUrl = request.ExcelUrl,
                SortNum = 0
            };
            var sheeList = new List<HiExcelTemplateSheetModel>();
            var mapList = new List<HiExcelHeaderMapEntity>();
            request.Sheets.ForEach(sheet =>
            {
                var sheetObj = new HiExcelTemplateSheetModel
                {
                    SourcesTableName = sheet.RefTableName,
                    TemplateId = excelTemplateObj.TemplateId,
                    SheetName = sheet.SheetName,
                    SortNum = 0
                };
                foreach (var map in sheet.HeaderColumnMap)
                {
                    var mapObj = new HiExcelHeaderMapEntity
                    {
                        HeadName = map.Key,
                        FieldName = map.Value,
                        MapId = Snowflake.NextId().ToString(),
                        SheetName = sheet.SheetName,
                        TemplateId = excelTemplateObj.TemplateId
                    };
                }
            });
            await new HiExcelRepository(this.sqlClient).SaveExcelExport(excelTemplateObj, sheeList, mapList);
            var resp = new ExcelExportSaveResponse
            {
                IsOk = true
            };
            return resp;
        }

        /// <summary>
        /// 最多导出到Excel的行数
        /// </summary>
        const int MaxRowCount = 1000000;


        public async Task<ExcelExportModel> ExcuteExcelExport(string templateId)
        {
            var (excelExportObj, sheetList, sheetHeaderMapList) = await new HiExcelRepository(this.sqlClient).GetExcelExport(templateId);
            var relativeExcelPath = excelExportObj.FileUrl;
            var positionSourcesFilePath = AppContext.BaseDirectory + relativeExcelPath;
            if (!File.Exists(positionSourcesFilePath))
            {
                throw new Exception("Excel模板文件不存在!");
            }
            var relativeDirPath = Path.GetDirectoryName(relativeExcelPath);
            var extName = Path.GetExtension(relativeExcelPath);
            var fileName = Path.GetFileName(relativeExcelPath);
            var currentDate = DateTime.Now.ToString("yyyy_MM_dd_hhmmsss");
            relativeDirPath = Path.Combine(relativeDirPath, "Export", currentDate);
            var relativeUrlPath = Path.Combine(relativeDirPath, fileName);
            var positionDirPath = AppContext.BaseDirectory + relativeDirPath;
            if (!Directory.Exists(positionDirPath))
            {
                Directory.CreateDirectory(positionDirPath);
            }
            var positionNewSavePath = AppContext.BaseDirectory + relativeUrlPath;
            File.Copy(positionSourcesFilePath, positionNewSavePath, true);
            var sheetMapDic = sheetHeaderMapList.GroupBy(r => r.SheetName).ToDictionary(r => r.Key, r => r.ToList());
            await sheetList.ParallelForEachAsync(async (sheetObj) =>
            {
                var tableName = sheetObj.SourcesTableName;
                if (!sheetMapDic.TryGetValue(sheetObj.SheetName, out List<HiExcelHeaderMapEntity> sheetHeaderMap))
                {
                    return;
                }
                int totalCount = 0;
                var queryFields = sheetHeaderMap.Select(r => r.FieldName).ToArray();
                sqlClient.Query(tableName).Field(queryFields[0]).Skip(1).Take(1).ToTable(ref totalCount);
                if (totalCount > MaxRowCount)//如果大余100W就不导出了
                {
                    return;
                }
                int pageSize = 10000;
                var headMap = sheetHeaderMap.ToDictionary(r => r.HeadName, r => r.FieldName);
                //保存到excel
                int totalPage = (totalCount + pageSize - 1) / pageSize;
                var excel = new Extension.Excel();
                int dataPageIndex = 1;
                await excel.DataTableToExcel(async () =>
                 {
                     if (dataPageIndex > totalPage)
                     {
                         return null;
                     }
                     int rowNumber = (dataPageIndex - 1) * pageSize;
                     var pageDT = sqlClient.Query(tableName).Skip(dataPageIndex).Take(pageSize).Field(queryFields).ToTable();
                     dataPageIndex += 1;
                     return Tuple.Create(pageDT, rowNumber);
                 }, sheetObj.SheetName, positionNewSavePath, headMap, sheetObj.HeaderRowNumber);
            }, 1);
            return new ExcelExportModel
            {
                UrlPath = (hiSqlConfig.SiteUrl + relativeUrlPath).Replace(@"\", "/")
            };
        }

    }
}