using HiSql.GUI.ApiModes;
using HiSql.GUI.ApiModes.Table;
using HiSql.GUI.Helper;
using HiSql;
using HiData.Framework;
using Microsoft.AspNetCore.Mvc;
using Dasync.Collections;
using HiSql.GUI.ApiModes.TableData;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Collections.Generic;
using HiSql.GUI.TimeJob;
using HiSql.GUI.Repository.Models;
using HiSql.GUI.Repository.HisSqlRepository;
using System.IO;
using Microsoft.AspNetCore.Http;
using HiSql.GUI.ApiModes.Oauth;

namespace HiSql.GUI.Services
{
    public class TableDataService : ServiceBase, ITransient
    {
        public TableDataService(
            HiSqlClient hiSqlClient,
            IHttpContextAccessor httpContextAccessor,
           TableTaskRepository _tableTaskRepository,
           DataExportJob _dataExportJob,
            UserAuthoritySerivce _userAuthoritySerivce
            ) : base(httpContextAccessor, hiSqlClient)
        {
            tableTaskRepository = _tableTaskRepository;
            dataExportJob = _dataExportJob;
            userAuthoritySerivce = _userAuthoritySerivce;
        }






        TableTaskRepository tableTaskRepository;
        DataExportJob dataExportJob;
        UserAuthoritySerivce userAuthoritySerivce;

        public async Task<TableDataAddResponse> Add(TableDataAddRequest request)
        {
            if (!await userAuthoritySerivce.HasAuth(this.TokenInfo.UId, request.TableName, UserAuthKeyConfig.HiTabletableDataadd))
            {
                throw new Exception($"资源{request.TableName}没有新增权限！");
            }
            List<Dictionary<string, object>> datas = request.Datas.Select(r => (Dictionary<string, object>)new TDynamic(r)).ToList();
            int addCount = await sqlClient.Insert(request.TableName, datas).ExecCommandAsync();
            return new TableDataAddResponse
            {
                AddCount = addCount
            };
        }


        public async Task<TransactionOperateResponse> TransactionOperate(TransactionOperateRequest request)
        {
            var resp = new TransactionOperateResponse();
            sqlClient.BeginTran(System.Data.IsolationLevel.ReadCommitted);
            try
            {
                await request.Operates.ParallelForEachAsync(async operate =>
                {
                    switch (operate.Type)
                    {
                        case TableOperate.Add:
                            var addResult = await Add(new TableDataAddRequest
                            {
                                Datas = operate.AddDatas,
                                TableName = operate.TableName
                            });
                            resp.AddCount += addResult.AddCount;
                            break;
                        case TableOperate.Delete:
                            var deleteResult = await Delete(operate.TableName, new TableDataDeleteRequest
                            {
                                WhereJson = operate.WhereJson,
                                HiSqlWhere = operate.HiSqlWhere,
                                HiSqlWhereParam = operate.HiSqlWhereParam,
                            });
                            resp.DeleteCount += deleteResult.DeleteCount;
                            break;
                        case TableOperate.Update:
                            var updateResult = await Update(operate.TableName, new TableDataUpdateRequest
                            {
                                UpdateSet = operate.UpdateSet,
                                WhereJson = operate.WhereJson,
                                HiSqlWhere = operate.HiSqlWhere,
                                HiSqlWhereParam = operate.HiSqlWhereParam,
                            });
                            resp.UpdateCount += updateResult.ModifyCount;
                            break;
                    }
                }, 1);
                sqlClient.CommitTran();
            }
            catch (Exception ex)
            {
                sqlClient.RollBackTran();
                throw ex;
            }
            return resp;
        }

        public async Task<BatchQueryResponse> BatchQuery(BatchQueryRequest request)
        {
            var resp = new BatchQueryResponse();
            await request.Querys.ParallelForEachAsync(async (r) =>
            {
                var queryResult = await Query(r.TableName, new TableDataQueryRequest
                {
                    Fields = r.Fields,
                    OrderByField = r.OrderByField,
                    PageIndex = r.PageIndex,
                    PageSize = r.PageSize,
                    WhereJson = r.WhereJson,
                    HiSqlWhere = r.HiSqlWhere,
                    HiSqlWhereParam = r.HiSqlWhereParam,
                });
                resp.Tables.Add(queryResult);
            }, maxDegreeOfParallelism: 1);
            return resp;
        }

        public async Task<TableDataUpdateResponse> Update(string tableName, TableDataUpdateRequest request)
        {
            if (!await userAuthoritySerivce.HasAuth(this.TokenInfo.UId, tableName, UserAuthKeyConfig.HiTabletableDataupdate))
            {
                throw new Exception($"资源{tableName}没有修改权限！");
            }
            Dictionary<string, object> updateFields = (Dictionary<string, object>)new TDynamic(request.UpdateSet);
            string sqlWhere = JsonQueryHelper.JsonWhereToSql(request.WhereJson);
            if (string.IsNullOrWhiteSpace(sqlWhere))
            {
                throw new Exception("请检查过滤条件！");
            }
            var modifyCount = await sqlClient.Update(tableName, updateFields).Where(sqlWhere).ExecCommandAsync();
            return new TableDataUpdateResponse
            {
                ModifyCount = modifyCount,
            };
        }


        public async Task<TableDataResponse> GetTableData(TableDataRequest param)
        {
            if (!await userAuthoritySerivce.HasAuth(this.TokenInfo.UId, param.TableName, UserAuthKeyConfig.HiTabletableDataquery))
            {
                throw new Exception($"资源{param.TableName}没有查询权限！");
            }
            var resp = new TableDataResponse();
            var query = sqlClient.Query(param.TableName).Field(param.Fields.Split(','));
            if (!string.IsNullOrWhiteSpace(param.HiSqlWhere))
            {
                //string sqlWhere = JsonQueryHelper.JsonWhereToSql(param.HiSqlWhere);
                query = query.Where(param.HiSqlWhere);
            }
            string sqlWhere = JsonQueryHelper.JsonWhereToSql(param.WhereJson);
            if (!string.IsNullOrWhiteSpace(sqlWhere))
            {
                query = query.Where(sqlWhere);
            }
            if (param.PageIndex >= 0)
            {
                query = query.Skip(param.PageIndex).Take(param.PageSize);
                int totalCount = 0;
                resp.List = await query
                .Sort(new SortBy {
                    {
                        param.OrderByField
                    }
                }).ToEObjectAsync(ref totalCount);
                resp.TotalCount = totalCount;
                resp.PageIndex = param.PageIndex;
            }
            else
            {
                resp.List = await query.ToEObjectAsync();
            }
            return resp;
        }


        /// <summary>
        /// 检查任务状态
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<CheckExportTaskStatusResponse> CheckExportTaskStatus(CheckExportTaskStatusRequest request)
        {
            var resp = new CheckExportTaskStatusResponse();
            var where = new Filter {
              { "TaskId", OperType.IN,request.TaskIds },
            };
            if (request.LastUpdateTime.HasValue)
            {
                where.Add("UpdateTime", OperType.GT, request.LastUpdateTime.Value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss.fff"));
            }
            var taskInfos = sqlClient.Query(TableTaskRepository.QueueTask).Field("*").Where(where).ToList<QueueTaskModel>();
            //var taskInfos = await tableTaskRepository.Value.Gets(request.TaskIds.ToArray());
            if (taskInfos != null)
            {
                resp.List.AddRange(taskInfos.Select(r => new TaskInfoModel
                {
                    TaskId = r.TaskId,
                    Result = r.Result,
                    Status = r.Status,
                    UpdateTime = r.UpdateTime
                }));
            }
            return resp;
        }

        public async Task<TableDataImportResponse> ImportExcelData(TableDataImportRequest req)
        {
            var fileName = req.file.FileName;
            var path = GetSavePath(fileName);
            var savePath = AppContext.BaseDirectory + path;
            var dirPath = Path.GetDirectoryName(savePath);
            if (dirPath != null && !Directory.Exists(dirPath))
            {
                Directory.CreateDirectory(dirPath);
            }
            using (Stream stream = new FileStream(savePath, FileMode.Create))
            {
                await req.file.CopyToAsync(stream);
            }
            var excel = new Extension.Excel(new Extension.ExcelOptions()
            {
                TempType = Extension.TempType.HEADER,
                DataBeginRow = 4,
                HeaderRow = 3
            });
            var sheetNames = excel.GetExcelSheetNames(savePath);
            var firstSheetName = sheetNames.FirstOrDefault();
            var dt = excel.ExcelToDataTable(savePath, true, sheetName: firstSheetName);
            var count = await sqlClient.Modi(req.TableName, dt.ToExpandObjectList()).ExecCommandAsync();
            return new TableDataImportResponse()
            {
                UpdateCount = count,
            };
        }


        /// <summary>
        /// 生成导入数据Excel保存路径
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        private static string GetSavePath(string fileName)
        {
            return $"/upload/excelImport/{fileName}";
        }

        public async Task<TableDataExportResponse> CreateExportTask(string tableName, TableDataExportRequest body)
        {
            var randomValue = new Random().Next();
            var taskId = $"{tableName}_{DateTime.Now:yyyyMMddhhmmssfff}{randomValue}";
            var taskParam = new DataExportParam()
            {
                TaskId = taskId,
                QueryParam = body,
                TableName = tableName,
                IsNullTemplate = body.IsNullTemplate
                //Sql
            };
            var model = new QueueTaskModel()
            {
                CreateTime = DateTime.Now,
                UpdateTime = DateTime.Now,
                Params = Newtonsoft.Json.JsonConvert.SerializeObject(taskParam),
                Result = string.Empty,
                Status = 0,
                TaskId = taskParam.TaskId,
                TaskType = 0,
            };
            await tableTaskRepository.SaveQueueTask(model);
            //Task.Run(() =>
            //{
            var dataJob = dataExportJob;
            Task.Delay(1000).ContinueWith((k) =>
            {
                dataJob.Execute(taskParam);
            });
            //}).Start();
            return new TableDataExportResponse
            {
                TaskId = model.TaskId
            };
        }

        public async Task<TableDataQueryResponse> Query(string tableName, TableDataQueryRequest param)
        {
            if (!await userAuthoritySerivce.HasAuth(this.TokenInfo.UId, tableName, UserAuthKeyConfig.HiTabletableDataquery))
            {
                throw new Exception($"资源{tableName}没有查询权限！");
            }
            var resp = new TableDataQueryResponse
            {
                TableName = tableName
            };
            var query = sqlClient.Query(tableName).Field(param.Fields?.Split(','));
            if (!string.IsNullOrWhiteSpace(param.HiSqlWhere))
            {
                //string sqlWhere = JsonQueryHelper.JsonWhereToSql(param.HiSqlWhere);
                query = query.Where(param.HiSqlWhere);
            }
            string sqlWhere = JsonQueryHelper.JsonWhereToSql(param.WhereJson);
            if (!string.IsNullOrWhiteSpace(sqlWhere))
            {
                query = query.Where(sqlWhere);
            }
            if (param.PageIndex >= 0)
            {
                query = query.Skip(param.PageIndex).Take(param.PageSize);
                int totalCount = 0;
                resp.List = await query
                .Sort(new SortBy {
                    { param.OrderByField??"" }
                }).ToEObjectAsync(ref totalCount);
                resp.TotalCount = totalCount;
            }
            else
            {
                resp.List = await query.ToEObjectAsync();
            }
            return resp;
        }


        /// <summary>
        /// 删除数据
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<TableDataDeleteResponse> Delete(string tableName, TableDataDeleteRequest body)
        {

            string sqlWhere = JsonQueryHelper.JsonWhereToSql(body.WhereJson);
            if (!body.IsClearTable && string.IsNullOrWhiteSpace(sqlWhere))
            {
                throw new Exception("请检查过滤条件！");
            }
            if (body.IsClearTable && string.IsNullOrWhiteSpace(sqlWhere))
            {
                if (!await userAuthoritySerivce.HasAuth(this.TokenInfo.UId, tableName, UserAuthKeyConfig.HiTabletableDatatruncate))
                {
                    throw new Exception($"资源{tableName}没有清空表权限！");
                }
                sqlClient.DbFirst.Truncate(tableName);//彻底删除
                return new TableDataDeleteResponse()
                {
                    IsOk = true
                };
            }
            if (!await userAuthoritySerivce.HasAuth(this.TokenInfo.UId, tableName, UserAuthKeyConfig.HiTabletableDatadelete))
            {
                throw new Exception($"资源{tableName}没有删除权限！");
            }
            var delResult = await sqlClient.Delete(tableName).Where(sqlWhere).ExecCommandAsync();
            return new TableDataDeleteResponse
            {
                DeleteCount = delResult,
                IsOk = delResult > 0
            };
        }

    }
}