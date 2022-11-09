using Dasync.Collections;
using HiSql.GUI.ApiModes;
using HiSql.GUI.ApiModes.Table;
using HiSql.GUI.Helper;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace HiSql.GUI.Services
{
    public class TableService : ServiceBase, ITransient
    {

        public TableService(IHttpContextAccessor httpContextAccessor, HiSqlClient hiSqlClient)
            : base(httpContextAccessor, hiSqlClient)
        {
        }

        const string hiFieldModelTableName = "Hi_FieldModel";
        const string hiTabModelTableName = "Hi_TabModel";
        const string hiFieldModelExtTableName = "Hi_FieldModelExt";


        static string tableStructQuery = string.Empty;


        /// <summary>
        /// 同步字段扩展表
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        private async Task<bool> syncFieldModel(string tableName)
        {
            var querySql = @"select f.FieldName,f.DbName,f.DbServer,f.TabName,fext.DbName as ExtDbName  
from Hi_FieldModel as f left join Hi_FieldModelExt as fext  
on   f.DbName = fext.DbName and f.DbServer = fext.DbServer and f.FieldName = fext.FieldName and f.TabName = fext.TabName
where f.TabName=@tabName";// and fext.DbName is not null
            var mapResult = await this.sqlClient.HiSql(querySql, new Dictionary<string, object> {
                {"tabName",tableName }
            }).ToEObjectAsync();
            var addList = new List<IDictionary<string, object>>();
            foreach (var item in mapResult)
            {
                var obj = (IDictionary<string, object>)item;
                if (!obj.ContainsKey("ExtDbName") || obj["ExtDbName"] == null)
                {
                    addList.Add(obj);
                }
            }
            if (addList.Count > 0)
            {
                await sqlClient.Insert(hiFieldModelExtTableName, addList).ExecCommandAsync();
            }
            return true;
        }


        private static string GetTableStructQuery(HiSqlClient sqlClient, List<string>? fieldTableExcludeField = null)
        {
            if (string.IsNullOrWhiteSpace(tableStructQuery))
            {
                var fieldTableInfo = sqlClient.Context.DMInitalize.GetTabStruct(hiFieldModelTableName);
                var fieldExtTableInfo = sqlClient.Context.DMInitalize.GetTabStruct(hiFieldModelExtTableName);
                var fieldExtField = "";
                var fieldField = "";
                var fieldTableExtCxcludeField = new List<string> {
                 "DbName","TabName","FieldName","DbServer"
                };
                fieldExtTableInfo.GetColumns.ForEach(r =>
                {
                    if (fieldTableExtCxcludeField.Contains(r.FieldName))
                        return;
                    fieldExtField += ",fext." + r.FieldName;
                });
                fieldTableInfo.GetColumns.ForEach(r =>
                {
                    fieldField += ",f." + r.FieldName;
                });
                fieldField = fieldField.Substring(1);
                tableStructQuery = @$"select  {fieldField}{fieldExtField}  from Hi_FieldModel as f left join Hi_FieldModelExt as fext  on   f.DbName = fext.DbName and f.DbServer = fext.DbServer and f.FieldName = fext.FieldName and f.TabName = fext.TabName ";
            }
            if (fieldTableExcludeField != null)
            {
                var resultSql = tableStructQuery;
                fieldTableExcludeField.ForEach(fieldName =>
                {
                    resultSql = resultSql.Replace(fieldName + ",", "");
                });
                return resultSql;
            }
            return tableStructQuery;
        }


        /// <summary>
        /// 获取表结构信息
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public async Task<object> GetTableInfo(string tableName)
        {
            System.Dynamic.ExpandoObject? tabProps;
            List<System.Dynamic.ExpandoObject>? tabColumns;
            var sqlParam = new Dictionary<string, object> {
                   {"TabName",tableName }
                };
            string? querySql;
            if (tableName == "NewTable")
            {
                sqlParam = new Dictionary<string, object> {
                   {"TabName",hiTabModelTableName }
                    //拿hiFieldModel做模板
                };
                tabProps = (await sqlClient.Query(hiTabModelTableName).Field("*").Where(new Filter { { "TabName", OperType.EQ, hiTabModelTableName }
                }).ToEObjectAsync()).FirstOrDefault();
                querySql = GetTableStructQuery(sqlClient, new List<string> {
                    "CreateName", "CreateTime", "ModiName", "ModiTime"
                });
                querySql += "where f.TabName = @TabName and f.FieldName in ( @FieldList )";
                sqlParam["FieldList"] = new List<string> {
                    "CreateName", "CreateTime", "ModiName", "ModiTime"//模板字段
                };
                tabColumns = await sqlClient.HiSql(querySql, sqlParam).ToEObjectAsync();
            }
            else
            {
                sqlClient.Context.DMInitalize.GetTabStruct(tableName);
                await syncFieldModel(tableName);
                tabProps = (await sqlClient.Query(hiTabModelTableName).Field("*").Where(new Filter { { "TabName", OperType.EQ, tableName }
                }).ToEObjectAsync()).FirstOrDefault();
                querySql = GetTableStructQuery(sqlClient, new List<string> { });
                sqlParam = new Dictionary<string, object> {
                   {"TabName",tableName }
                };
                if (tableName == hiFieldModelTableName)
                {
                    querySql += "where f.TabName = @TabName or (f.TabName = @ExtTabName and fext.FieldName not in (@ExtExcluderColumn))";
                    sqlParam["ExtTabName"] = hiFieldModelExtTableName;
                    sqlParam["ExtExcluderColumn"] = new List<string> {
                        "DbName",
                        "TabName",
                        "FieldName",
                        "DbServer"
                    };
                }
                else
                {
                    querySql += "where f.TabName = @TabName";
                }
                tabColumns = await sqlClient.HiSql(querySql, sqlParam).ToEObjectAsync();
            }
            var tabColumnStruct = await GetTabColumnStrct(hiFieldModelTableName);
            var tabPropStruct = await GetTabColumnStrct(hiTabModelTableName);
            //await sqlClient.Query(hiTabModelTableName).Field("*").Where(new Filter {
            //{ "TabName", OperType.EQ, hiTabModelTableName }
            //}).ToEObjectAsync();
            return new
            {
                TabColumnStruct = tabColumnStruct,
                TabColumns = tabColumns,
                TabPropStruct = tabPropStruct,
                TabProps = tabProps
            };
        }






        /// <summary>
        /// 获取表列信息
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public async Task<object> GetTableColumns(TableGetColumnsRequest param)
        {
            sqlClient.Context.DMInitalize.GetTabStruct(param.TableName);
            var tabColumnStruct = await GetTabColumnStrct(param.TableName);
            return new TableGetColumnsResponse
            {
                TabColumnStruct = tabColumnStruct
            };
        }

        private async Task<List<System.Dynamic.ExpandoObject>> GetTabColumnStrct(string tableName)
        {
            var querySql = GetTableStructQuery(sqlClient, new List<string> { }) + " where f.TabName=@TabName";
            var sqlParam = new Dictionary<string, object> {
                   {"TabName",tableName }
            };
            if (tableName == hiFieldModelTableName)
            {
                querySql += " or (f.TabName= @ExtTabName and f.FieldName not in (@ExcluderColumn))";
                sqlParam["ExtTabName"] = hiFieldModelExtTableName;
                sqlParam["ExcluderColumn"] = new List<string> { "DbName", "TabName", "FieldName", "DbServer" };
            }
            var tabColumnStruct = await sqlClient.HiSql(querySql, sqlParam).ToEObjectAsync();
            return tabColumnStruct;
        }

        public async Task<TableDataResponse> GetTableData(TableDataRequest param)
        {
            var resp = new TableDataResponse();
            var query = sqlClient.Query(param.TableName).Field(param.Fields.Split(','));
            if (!string.IsNullOrWhiteSpace(param.HiSqlWhere))
            {
                if (param.HiSqlWhereParam.Count == 0)
                {
                    query = query.Where(param.HiSqlWhere);
                }
                else
                {
                    //string sqlWhere = JsonQueryHelper.JsonWhereToSql(param.HiSqlWhere);
                    //query = query.Where(param.HiSqlWhere,);
                    var sql = $"select {param.Fields} from {param.TableName} where {param.HiSqlWhere}";
                    query = sqlClient.HiSql(sql, param.HiSqlWhereParam);
                }
            }
            else
            {
                string sqlWhere = JsonQueryHelper.JsonWhereToSql(param.WhereJson);
                if (!string.IsNullOrWhiteSpace(sqlWhere))
                {
                    query = query.Where(sqlWhere);
                }
            }

            if (param.PageIndex >= 0)
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                query = query.Skip(param.PageIndex).Take(param.PageSize);
                int totalCount = 0;
                resp.List = await query
                    .Sort(new SortBy { { param.OrderByField }
                    }).ToEObjectAsync(ref totalCount);
                sw.Stop();
                TimeSpan ts2 = sw.Elapsed;
                Console.WriteLine($"分页查询总共花费{ts2.TotalMilliseconds}ms.");
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
        /// 保存表格结构信息
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<SaveTableResponse> SaveTableInfo(SaveTableInfoRequest request)
        {
            var hiTable = request.TabProps?.ToObject<HiTable>();
            var fieldTableInfo = sqlClient.Context.DMInitalize.GetTabStruct(hiFieldModelTableName);
            var pHiColumnNames = (typeof(HiColumn)).GetProperties().Where(p => p.CanRead && p.CanWrite && p.MemberType == MemberTypes.Property).Select(r => r.Name).ToList();
            var columns = request.TabColumnStruct?.Select(c => c.ToObject<HiColumn>()).ToList();
            var saveColumns = new List<HiColumn>();
            Dictionary<string, bool> columnNames = new Dictionary<string, bool>();
            if (request.TableName == hiFieldModelTableName)
            {
                foreach (var item in columns)
                {
                    if (pHiColumnNames.Contains(item.FieldName))
                    {
                        if (columnNames.ContainsKey(item.FieldName))
                        {
                            continue;
                        }
                        columnNames.Add(item.FieldName, true);
                        saveColumns.Add(item);
                    }
                }
            }
            else
            {
                saveColumns.AddRange(columns);
            }
            var opLevel = (OpLevel)request.OPLevel;
            Tuple<bool, string, string> saveResult = null;
            var tableInfo = new TabInfo(hiTable, saveColumns);
            if (!request.IsView)
            {
                if (!sqlClient.DbFirst.CheckTabExists(hiTable.TabName))
                {
                    var isCreate = sqlClient.DbFirst.CreateTable(tableInfo);
                    saveResult = new Tuple<bool, string, string>(isCreate, "", isCreate ? "创建成功!" : "创建失败!");
                }
                else
                {
                    saveResult = sqlClient.DbFirst.ModiTable(tableInfo, opLevel);
                    HiSqlCommProvider.RemoveTabInfoCache(tableInfo.TabModel.TabName, sqlClient.Context.CurrentConnectionConfig.DbType);
                }
            }
            var dicColumns = request.TabColumnStruct?.Select(c => c.ToObject<Dictionary<string, object>>()).ToList();
            var pNames = dicColumns?.FirstOrDefault()?.Select(r => r.Key).ToList();

            var onlyFields = pNames?.Where(r => !pHiColumnNames.Contains(r)).ToArray();
            try
            {
                //字段在2个表里,所以要分开更新 
                var upResult = await sqlClient.Update(hiFieldModelTableName, dicColumns).Exclude(onlyFields).ExecCommandAsync();
                upResult = await sqlClient.Update(hiFieldModelExtTableName, dicColumns).Only(onlyFields).ExecCommandAsync();
                Console.WriteLine(upResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
            var isOK = saveResult?.Item1 ?? true;
            if (saveResult.Item2.Contains("无变更"))
            {
                isOK = true;
            }
            var message = saveResult?.Item2 ?? "未修改";
            var sql = saveResult?.Item3 ?? "NoSql";
            return new SaveTableResponse
            {
                IsOk = isOK,
                Sql = sql,
                Message = message,
            };
        }

        public async Task<TableViewCreateResponse> CreateViewTable(TableViewCreateRequest request)
        {
            if (sqlClient.DbFirst.CheckTabExists(request.TableName))
            {
                sqlClient.DbFirst.ModiView(request.TableName, request.Sql, OpLevel.Execute);
            }
            else
            {
                sqlClient.DbFirst.CreateView(request.TableName, request.Sql, OpLevel.Execute);
            }

            var result = sqlClient.DbFirst.CreateView(request.TableName, request.Sql, OpLevel.Execute);
            return new TableViewCreateResponse()
            {
                IsOk = result.Item1
            };
        }

        /// <summary>
        /// 创建表索引
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<TableIndexCreateResponse> CreateIndex(TableIndexCreateRequest request)
        {
            var columns = request.Columns.Select(c => c.ToObject<HiColumn>()).ToList();
            var excuteResult = sqlClient.DbFirst.CreateIndex(request.TableName, request.IndexName, columns, OpLevel.Execute);
            var isOK = excuteResult.Item1;
            var message = excuteResult.Item2;
            var sql = excuteResult.Item3;
            return new TableIndexCreateResponse
            {
                IsOk = isOK,
                Sql = sql,
                Message = message,
            };
        }

        /// <summary>
        /// 删除索引
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<TableIndexDeleteResponse> DeleteIndex(TableIndexDeleteRequest request)
        {
            var excuteResult = sqlClient.DbFirst.DelIndex(request.TableName, request.IndexName, OpLevel.Execute);
            var isOK = excuteResult.Item1;
            var message = excuteResult.Item2;
            var sql = excuteResult.Item3;
            return new TableIndexDeleteResponse
            {
                IsOk = isOK,
                Sql = sql,
                Message = message,
            };
        }

        /// <summary>
        /// 获取表索引
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public async Task<TableIndexsResponse> GetIndexs(string tableName)
        {
            var indexs = this.sqlClient.DbFirst.GetTabIndexs(tableName);
            return new TableIndexsResponse
            {
                List = indexs
            };
        }



        public async Task<object> Delete(TableDeleteRequest param)
        {
            var delResult = await sqlClient.Delete(param.TableName).Where(new Filter { { "TabName", OperType.EQ, param.TableName } }).ExecCommandAsync();
            return delResult;
        }


        ///// <summary>
        ///// 根据Excel生产表
        ///// </summary>
        ///// <param name="request"></param>
        ///// <returns></returns>
        //public async Task<ExcelCreateTableResponse> CreateExcelTable(ExcelCreateTableRequest request)
        //{
        //    var file = request.file;
        //    var fileName = file.FileName;
        //    var path = GetSavePath(fileName);
        //    var savePath = AppContext.BaseDirectory + path;
        //    var dirPath = Path.GetDirectoryName(savePath);
        //    if (dirPath != null && !Directory.Exists(dirPath))
        //    {
        //        Directory.CreateDirectory(dirPath);
        //    }
        //    using (Stream stream = new FileStream(savePath, FileMode.Create))
        //    {
        //        await file.CopyToAsync(stream);
        //    }
        //    await CreateTable(this.sqlClient, savePath, request.TableName);
        //    return new ExcelCreateTableResponse
        //    {
        //        TableName = fileName
        //    };
        //}

        //public static async Task<Tuple<TabInfo, DataTable>> CreateTable(HiSqlClient hisqlClient, string tableName, string savePath)
        //{
        //    var excel = new Extension.Excel(new Extension.ExcelOptions()
        //    {
        //        TempType = Extension.TempType.HEADER,
        //        DataBeginRow = 0,
        //        HeaderRow = 1
        //    });
        //    var sheetNames = excel.GetExcelSheetNames(savePath);
        //    if (sheetNames == null)
        //    {
        //        throw new Exception("Excel读取失败！");
        //    }
        //    var dt = excel.ExcelToDataTable(savePath, false, sheetName: sheetNames[0]);
        //    var tableInfo = await HiSqlDataHelper.DataTableToTableInfo(tableName, dt);
        //    hisqlClient.DbFirst.CreateTable(tableInfo);
        //    dt.Rows.Remove(dt.Rows[0]);//移除表头
        //    try
        //    {
        //        var dtList = dt.ToExpandObjectList();
        //        var insertResult = await hisqlClient.Insert(tableInfo.TabModel.TabName, dtList).ExecCommandAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine(ex);
        //    }
        //    return Tuple.Create(tableInfo, dt);
        //}


        private static string GetSavePath(string fileName)
        {
            return $"/upload/excelTable/{fileName}";
        }

        public async Task<ExcelHiColumnResponse> GetExcelColumn(IFormFile file)
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
            var excel = new Extension.Excel(new Extension.ExcelOptions()
            {
                TempType = Extension.TempType.HEADER,
                DataBeginRow = 0,
                HeaderRow = 1
            });
            var sheetNames = excel.GetExcelSheetNames(savePath);
            if (sheetNames == null)
            {
                throw new Exception("Excel读取失败！");
            }
            var dt = excel.ExcelToDataTable(savePath, false, sheetName: sheetNames[0]);
            var hiColumns = await HiSqlDataHelper.GetDataTableHiColumn(dt);
            return new ExcelHiColumnResponse
            {
                HiColumns = hiColumns
            };
        }
    }
}