using HiSql.GUI.ApiModes;
using HiSql.GUI.Framework.DependencyInjection;
using HiSql.GUI.Framework.StaticFileHelper;
using HiSql.GUI.Helper;
using HiSql.GUI.Repository.HisSqlRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace HiSql.GUI.TimeJob
{

    public class DataExportParam
    {
        public string TaskId { get; set; }

        public string TableName { get; set; }

        public string Sql { get; set; }

        public QueryParamBase QueryParam { get; set; }

        /// <summary>
        /// 是否为导出空模板
        /// </summary>
        public bool IsNullTemplate { get; set; }

    }

    public class DataExportJob : ISelfTransient
    {
        HiSqlClient sqlClient;

        ITableTaskRepository tableTaskRepository;

        public DataExportJob(HiSqlClient _hiSqlClient, ITableTaskRepository _tableTaskRepository)
        {
            sqlClient = _hiSqlClient;
            tableTaskRepository = _tableTaskRepository;
        }

        public async Task<string> Execute(DataExportParam param)
        {
            var sw = new Stopwatch();
            sw.Start();
            try
            {
                await tableTaskRepository.UpdateQueueTaskState(param.TaskId, 0, 1);
                var files = await SaveDataToExcel(param);
                var zipPath = GetZipPath(param.TaskId);
                await ZipFileHelper.FilesToZip(files, AppContext.BaseDirectory + zipPath);
                await tableTaskRepository.CompulateQueueTask(param.TaskId, 200, new
                {
                    FilePath = zipPath,
                    TotalTime = sw.Elapsed.TotalSeconds,
                });
                return zipPath;
            }
            catch (Exception ex)
            {
                //记录异常
                await tableTaskRepository.CompulateQueueTask(param.TaskId, 500, new
                {
                    Message = ex.Message,
                    InnerMessage = ex.InnerException?.InnerException?.Message ?? string.Empty,
                    TotalTime = sw.Elapsed.TotalSeconds,
                });
            }
            return string.Empty;
        }

        private async Task<List<string>> SaveDataToExcel(DataExportParam param)
        {
            int maxPageSize = param.IsNullTemplate ? 10 : 10000;//最多10W条
            var qp = param.QueryParam;
            IQuery query = GetQuery(param, qp);
            var totalCount = 0;
            var dt = query.Skip(1).Take(maxPageSize).ToTable(ref totalCount);
            var hasNextPage = totalCount > maxPageSize;
            TabInfo tableInfo;
            string tableName = param.TableName;
            if (string.IsNullOrWhiteSpace(tableName))
            {
                tableName = "SQLQuery";
                tableInfo = await HiSqlDataHelper.DataTableToTableInfo(tableName, dt);
            }
            else
            {
                tableInfo = sqlClient.Context.DMInitalize.GetTabStruct(tableName);
            }
            var fileList = new List<string>();
            string savePath;
            if (param.IsNullTemplate)
            {
                //保存表头就可以了
                savePath = AppContext.BaseDirectory + GetFilePath(param.TaskId, tableName + "_模板");
                await SavePageExcel(tableInfo, dt, savePath, true);//保存模板
                fileList.Add(savePath);
                return fileList;
            }
            var fileNameFix = GetExcelName(1, maxPageSize, dt.Rows.Count);
            savePath = AppContext.BaseDirectory + GetFilePath(param.TaskId, fileNameFix);
            await SavePageExcel(tableInfo, dt, savePath, false);
            fileList.Add($"{savePath}");
            if (hasNextPage)
            {
                int totalPage = (totalCount + maxPageSize - 1) / maxPageSize;
                for (int i = 2; i <= totalPage; i++)
                {
                    var currentValue = ((i - 1) * 100 / totalPage);
                    await tableTaskRepository.CompulateQueueTask(param.TaskId, 1, new
                    {
                        Message = $"已生导出数据[{currentValue}]%"
                    });
                    query = GetQuery(param, qp);
                    dt = query.Skip(i).Take(maxPageSize).ToTable();
                    fileNameFix = GetExcelName(i, maxPageSize, dt.Rows.Count);
                    savePath = AppContext.BaseDirectory + GetFilePath(param.TaskId, fileNameFix);
                    await SavePageExcel(tableInfo, dt, savePath, false);
                    fileList.Add($"{savePath}");
                }
            }
            return fileList;
        }

        private IQuery GetQuery(DataExportParam param, QueryParamBase qp)
        {
            IQuery query = sqlClient.Query(param.TableName)
            .Sort(new SortBy {
            {
                    qp.OrderByField??""
                }
            })
            .Field((qp.Fields ?? "*").Split(','));
            if (!string.IsNullOrWhiteSpace(qp.HiSqlWhere))
            {
                query = query.Where(qp.HiSqlWhere);
            }
            string sqlWhere = JsonQueryHelper.JsonWhereToSql(qp.WhereJson);
            if (!string.IsNullOrWhiteSpace(sqlWhere))
            {
                query = query.Where(sqlWhere);
            }

            return query;
        }

        private static string GetZipPath(string taskId)
        {
            return $"/dowload/excel/{taskId}.zip";
        }

        /// <summary>
        /// 生成文件保存路径
        /// </summary>
        /// <param name="taskId"></param>
        /// <param name="fileNameFix"></param>
        /// <returns></returns>
        private static string GetFilePath(string taskId, string fileNameFix)
        {
            return $"/dowload/excel/{taskId}/{fileNameFix}.xlsx";
        }



        /// <summary>
        /// 生产excel文件名
        /// </summary>
        /// <param name="taskId"></param>
        /// <param name="pageSize"></param>
        /// <param name="pageIndex"></param>
        /// <returns></returns>
        static string GetExcelName(int pageIndex, int pageSize, int count)
        {
            int startCount = (pageIndex - 1) * pageSize;
            int endCount = startCount + count;
            return $"{pageIndex}_{startCount + 1}~{endCount}";
        }


        /// <summary>
        /// 数据保存到Excel
        /// </summary>
        /// <param name="tableInfo"></param>
        /// <param name="dt"></param>
        /// <param name="savePath"></param>
        /// <returns></returns>
        static async Task SavePageExcel(TabInfo tableInfo, DataTable dt, string savePath, bool isNullTemplate)
        {
            Extension.Excel excel = new Extension.Excel(new Extension.ExcelOptions()
            {
                TempType = Extension.TempType.HEADER
            });
            excel.Add(new Extension.ExcelHeader(1).Add("表名").Add(tableInfo.TabModel.TabName));//标识表名
            //中文头
            Extension.ExcelHeader cnHeader = new Extension.ExcelHeader(2);
            //英文头
            Extension.ExcelHeader enHeader = new Extension.ExcelHeader(3);

            var excludeFields = new List<string>() {//模板忽略字段
                "CreateTime",
                "CreateName",
                "ModiTime",
                "ModiName"
            };
            foreach (DataColumn dataColumn in dt.Columns)
            {
                if (isNullTemplate && excludeFields.Contains(dataColumn.ColumnName))
                {
                    continue;
                }
                HiColumn hiColumn = tableInfo.Columns.Where(c => c.FieldName.Equals(dataColumn.ColumnName)).FirstOrDefault();
                if (hiColumn != null)
                {
                    //自增主键不能填也不能改
                    var tipStr = hiColumn.IsIdentity ? "[不可修改]" : "";
                    var cnName = (string.IsNullOrEmpty(hiColumn.FieldDesc) ? dataColumn.ColumnName : hiColumn.FieldDesc) + tipStr;
                    cnHeader.Add(tipStr);
                }
                else
                {
                    cnHeader.Add(dataColumn.ColumnName);
                }
                enHeader.Add(dataColumn.ColumnName);
            }
            excel.Add(cnHeader);//字段中文描述
            excel.Add(enHeader);//字段名
            if (isNullTemplate)
            {
                dt.Clear();
            }
            //生成excel
            excel.WriteExcel(dt, savePath);

        }
    }
}
