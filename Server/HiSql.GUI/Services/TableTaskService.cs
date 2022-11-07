using HiSql.GUI.ApiModes.TableTask;
using HiSql.GUI.TimeJob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dasync.Collections;
using HiSql.GUI.Repository.Models;
using System.Dynamic;
using System.Diagnostics;
using HiSql.GUI.Repository.HisSqlRepository;
using HiSql.GUI.Helper;
using Microsoft.AspNetCore.Http;

namespace HiSql.GUI.Services
{
    public class TableTaskService : ServiceBase, ITransient
    {

        public const string TableName = "Hi_Task";


        QuartzExtend quartzExtend;

        Lazy<ExcelService> excelService;


        Lazy<ITableTaskRepository> tableTaskRepository;

        public TableTaskService(IHttpContextAccessor httpContextAccessor, HiSqlClient _hiSqlClient, QuartzExtend _quartzExtend, Lazy<ExcelService> _excelService, Lazy<ITableTaskRepository> _tableTaskRepository)
            : base(httpContextAccessor, _hiSqlClient)
        {
            quartzExtend = _quartzExtend;
            excelService = _excelService;
            tableTaskRepository = _tableTaskRepository;
        }


        public async Task<TableTaskSaveResponse> TableTaskSave(TableTaskSaveRequest request)
        {
            request.TableTask.UpdateTime = DateTime.Now;
            var modifyCount = await sqlClient.Modi(TableName, request.TableTask).ExecCommandAsync();
            //.Exclude("CreateDate", "TaskId")//忽略字段
            //.ExecCommandAsync();
            await quartzExtend.SaveTableTask(request.TableTask);
            var resp = new TableTaskSaveResponse()
            {
                ModifyCount = modifyCount
            };
            return resp;
        }


        public async Task<TableTaskDeleteResponse> Delete(TableTaskDeleteRequest request)
        {
            var resp = new TableTaskDeleteResponse();
            await request.TaskIds.ParallelForEachAsync(async taskId =>
             {
                 var deleteCount = await sqlClient.Delete(TableName, new Filter {
                    { "TaskId",OperType.EQ ,taskId }
                  }).ExecCommandAsync();
                 if (deleteCount > 0)
                 {
                     await quartzExtend.RemoveTableTask(taskId);
                 }
             });
            return resp;
        }

        public async Task<TableTaskStateSyncResponse> StateSync(TableTaskStateSyncRequest request)
        {
            var resp = new TableTaskStateSyncResponse();
            var taskListMap = sqlClient.Query(TableName).Field("*").Where(new Filter {
                { "TaskId",OperType.IN,request.TaskIds},
                { "Status" , OperType.EQ , 1 }
            }).ToList<TableTaskModel>().ToDictionary(r => r.TaskId, r => r);
            await request.TaskIds.ParallelForEachAsync(async taskId =>
            {
                if (taskListMap.ContainsKey(taskId))
                {
                    await quartzExtend.SaveTableTask(taskListMap[taskId]);
                    resp.UpdateCount++;
                }
                else
                {
                    await quartzExtend.RemoveTableTask(taskId);
                    resp.DeleteCount++;
                }
            });
            return resp;
        }

        internal async Task<TableTaskExuteResponse> Excute(TableTaskExuteRequest request)
        {
            var taskList = sqlClient.Query(TableName).Field("*").Where(new Filter {
                { "TaskId",OperType.EQ,request.TaskId},
                { "Status" , OperType.EQ , 1 }
            }).ToList<TableTaskModel>();
            if (taskList.Count > 0)
            {
                var taskInfo = taskList[0];
                var loggerMessage = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss},当前任务执行:[{taskInfo.Title}]";
                Console.WriteLine(loggerMessage);
                Stopwatch sw = new Stopwatch();
                sw.Start();
                var startDate = DateTime.Now;
                try
                {
                    var jobResult = await JobExecute(taskInfo);
                    var innerMessage = Newtonsoft.Json.JsonConvert.SerializeObject(jobResult);
                    await tableTaskRepository.Value.AddLog(
                          taskInfo.TaskId, $"任务:{taskInfo.Title},执行成功！耗时:{sw.ElapsedMilliseconds}毫秒,开始时间：{startDate.ToString("MM-dd HH:mm:ss")},结束时间：{DateTime.Now.ToString("MM-dd HH:mm:ss")}", 200,
                          innerMessage: innerMessage,
                          excuteTime: sw.ElapsedMilliseconds
                          );
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                    await tableTaskRepository.Value.AddLog(
                           taskInfo.TaskId,
                           ex.Message, 500,
                           innerMessage: ex.InnerException?.StackTrace ?? "",
                           excuteTime: sw.ElapsedMilliseconds
                           );
                }
            }

            return new TableTaskExuteResponse
            {

            };
        }





        private async Task<object> JobExecute(TableTaskModel taskInfo)
        {
            object result = new object();
            if (taskInfo.Type == "SQL")
            {
                var tableName = $"{taskInfo.StoreName}";
                switch (taskInfo.StoreType)
                {
                    case "NewCreate":
                        result = await NewCreateData(taskInfo, tableName);
                        break;
                    case "MergeCreate":
                        result = await MergeCreateData(taskInfo, tableName);
                        break;
                    case "ReCreate":
                        result = await ReCreateData(taskInfo, tableName);
                        break;
                }
            }
            else if (taskInfo.Type == "API")
            {
                throw new NotImplementedException();
            }
            else if (taskInfo.Type == "ExcelExport")
            {
                result = await excelService.Value.ExcuteExcelExport(taskInfo.TemplateId);
            }
            else
            {
                throw new NotImplementedException();
            }
            if (!string.IsNullOrWhiteSpace(taskInfo.EventUrl))
            {
                //触发通知
                await HttpClientHelper.PostData(taskInfo.EventUrl, result);
            }
            return result;
        }

        private async Task<object> NewCreateData(TableTaskModel taskInfo, string tableName)
        {
            tableName += DateTime.Now.ToString(taskInfo.SotreFormat);

            var primaryKeyName = "Id";
            if (!sqlClient.DbFirst.CheckTabExists(tableName))
            {
                primaryKeyName = await CreateTable(tableName, taskInfo.SQL, primaryKeyName);
            }
            else
            {
                var tableInfo = sqlClient.DbFirst.GetTabStruct(tableName);
                primaryKeyName = tableInfo?.GetColumns?.FirstOrDefault(r => r.IsPrimary)?.FieldName;
            }
            await MergeCreateData(taskInfo, tableName, (r) =>
            {
                var setObj = r as IDictionary<string, Object>;
                setObj[primaryKeyName] = HiSql.Snowflake.NextId();
            });
            return new
            {
                NewTableName = tableName
            };
        }

        private async Task<object> MergeCreateData(TableTaskModel taskInfo, string tableName, Action<ExpandoObject>? setPrimay = null)
        {
            int totalCount = 0;
            int pageSize = 10000;
            var pageData = await sqlClient.HiSql(taskInfo.SQL).Skip(1).Take(pageSize).ToEObjectAsync(ref totalCount);
            if (setPrimay != null && pageData.Count > 0)
            {
                pageData.ForEach(r =>
                {
                    setPrimay(r);
                });
            }
            var k = sqlClient.Modi(tableName, pageData).ExecCommand();
            if (totalCount > pageSize)
            {
                int totalPage = (totalCount + pageSize - 1) / pageSize;
                for (int i = 2; i <= totalPage; i++)
                {
                    pageData = await sqlClient.HiSql(taskInfo.SQL).Skip(i).Take(pageSize).ToEObjectAsync();
                    if (setPrimay != null && pageData.Count > 0)
                    {
                        pageData.ForEach(r =>
                        {
                            setPrimay(r);
                        });
                    }
                    sqlClient.Modi(tableName, pageData);
                }
            }
            return new { };
        }

        private async Task<object> ReCreateData(TableTaskModel? taskInfo, string tableName)
        {
            //先清空数据
            await sqlClient.Delete(tableName).Where(new Filter()).ExecCommandAsync();
            sqlClient.HiSql(taskInfo.SQL).Insert(tableName);
            return new object();
        }

        public async Task<string> CreateTable(string tableName, string querySql, string primaryKeyName)
        {
            var tableColumns = sqlClient.HiSql(querySql).ToColumns();
            var hiTable = new HiTable()
            {
                TabName = tableName,
            };
            tableColumns.ForEach(r =>
            {
                r.TabName = tableName;
            });
            while (tableColumns.Any(r => r.FieldName == primaryKeyName))
            {
                primaryKeyName += "_";
            }
            //添加一个主键列
            tableColumns.Add(new HiColumn
            {
                FieldName = primaryKeyName,
                FieldType = HiType.BIGINT,
                IsPrimary = true
            });
            HiSql.Snowflake.WorkerId = 0;
            var tableInfo = new TabInfo(hiTable, tableColumns);
            this.sqlClient.DbFirst.CreateTable(tableInfo);
            return primaryKeyName;
        }


    }
}
