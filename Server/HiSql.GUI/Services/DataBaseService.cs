using HiSql.GUI.ApiModes.DataBase;
using HiSql.GUI.ApiModes.Table;
using HiSql.GUI.Repository.Interface;
using HiSql;
using Dasync.Collections;
using HiSql.GUI.Repository.Models;
using System.Dynamic;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Threading.Tasks;
using HiData.Framework;
using HiSql.GUI.Repository.HisSqlRepository;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using HiSql.GUI.Helper;
using HiSql.GUI.ApiModes.Oauth;
using HiSql.GUI.Services;

namespace HiSql.GUI
{
    public class DataBaseService : ServiceBase, ITransient
    {
        private readonly HiSqlClient sqlClient;

        private readonly IHiApiRepository hiApiRepository;

        private readonly UserAuthoritySerivce userAuthoritySerivce;

        public DataBaseService(IHttpContextAccessor httpContextAccessor, HiSqlClient hiSqlClient, IHiApiRepository _hiApiRepository, UserAuthoritySerivce _userAuthoritySerivce)
           : base(httpContextAccessor, hiSqlClient)
        {
            sqlClient = hiSqlClient;
            hiApiRepository = _hiApiRepository;
            userAuthoritySerivce = _userAuthoritySerivce;
        }

        public async Task<GetTablesResponse> GetTables(GetTablesRequest request)
        {
            List<TableInfo> tables = new List<TableInfo>();
            if (request.Type == 0)
            {
                tables.AddRange(sqlClient.DbFirst.GetTables());
            }
            else if (request.Type == 1)
            {
                tables.AddRange(sqlClient.DbFirst.GetViews());
            }
            var tableNames = tables.Select(x => x.TabName).ToArray();
            var userInfo = this.TokenInfo;
            tableNames = await userAuthoritySerivce.HasAuth(userInfo.UId, tableNames.ToArray());
            tables = tables.Where(r => tableNames.Contains(r.TabName)).ToList();
            return new GetTablesResponse
            {
                List = tables
            };
        }

        public async Task<ApiTestExcuteResponse> ApiTestExcute(ApiTestExcuteRequest request, JwtPlayload loginUser)
        {
            var hisql = request.HiSql;
            var resp = new ApiTestExcuteResponse();
            var hiSqlParam = request.Params?.ToDictionary(x => $"{x.Key}", x => x.Value as object) ?? new Dictionary<string, object>();
            if (request.HiSqlWhereParam?.Keys.Count > 0)
            {
                foreach (var sqlParamKey in request.HiSqlWhereParam.Keys)
                {
                    hiSqlParam[sqlParamKey] = request.HiSqlWhereParam[sqlParamKey];
                }
            }
            if (hiSqlParam.ContainsKey("LoginUId"))
            {
                hiSqlParam["LoginUId"] = loginUser.UId;
            }
            var genWhereSql = false;
            if (request.Params?.Count > 0)
            {
                string sqlWhere = JsonQueryHelper.JsonWhereToSql(JObject.FromObject(request.Params));
                if (!string.IsNullOrWhiteSpace(sqlWhere) && hisql.Contains("$Where$"))
                {
                    hisql = hisql.Replace("$Where$", $"where {sqlWhere}");
                    genWhereSql = true;
                }
            }
            hisql = hisql.Replace("$Where$ ", string.Empty);//去除无用Where占位

            IQuery query = (!genWhereSql && hiSqlParam?.Count > 0) ? sqlClient.HiSql(hisql, hiSqlParam) : sqlClient.HiSql(hisql);
            if (request.PageIndex >= 0)
            {
                query = query.Skip(request.PageIndex).Take(request.PageSize);
                int totalCount = 0;
                resp.List = await query
            //.Sort(new SortBy {
            //    { request.OrderByField??"" }
            //})
            .ToEObjectAsync(ref totalCount);
                resp.TotalCount = totalCount;
            }
            else
            {
                resp.List = await query.ToEObjectAsync();
            }
            //var k = resp.List.ToJson();
            return resp;
        }



        /// <summary>
        /// 获取数据库版本号
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<DataBaseVersionResponse> GetDBVersion(DataBaseVersionRequest request)
        {
            var versionObj = sqlClient.Context.DMTab.DBVersion();
            return new DataBaseVersionResponse
            {
                Version = $"{sqlClient.CurrentConnectionConfig.DbType} 版本号：{versionObj.Version.ToString()}",
                VersionDesc = $"版本描述：{versionObj.VersionDesc}",
            };
        }



        /// <summary>
        /// 执行通用API请求 
        /// </summary>
        /// <param name="request"></param>
        /// 3
        /// 
        /// <returns></returns>
        public async Task<HiApiResponse> HiApiExcute(HiApiRequest request, JwtPlayload loginUser)
        {
            HiApiInfo? apiInfo = null;
            if (!string.IsNullOrWhiteSpace(request.ApiId))
            {
                apiInfo = hiApiRepository.Get(request.ApiId);
            }
            else if (!string.IsNullOrWhiteSpace(request.ApiName) && !string.IsNullOrWhiteSpace(request.GroupName))
            {
                apiInfo = hiApiRepository.Get(request.ApiName, request.GroupName);
            }
            if (apiInfo == null)
            {
                throw new Exception("API不存在!");
            }
            var resp = new HiApiResponse();
            var paramGroups = apiInfo.Param.GroupBy(r => r.ApiBodyId.Trim()).ToDictionary(r => r.Key.ToLower(), r => r.ToList());
            var blockResultMap = new Dictionary<string, List<IDictionary<string, object>>>();
            int index = 0;
            var globalParam = (IDictionary<string, object>)request.Body;
            await apiInfo.Blocks.ParallelForEachAsync(async (blockInfo) =>
            {
                var apiBodyId = blockInfo.ApiBodyId.ToLower();
                List<HiApiParamEntitySimple> paramList = new List<HiApiParamEntitySimple>();
                if (paramGroups.ContainsKey(apiBodyId))
                {
                    paramList.AddRange(paramGroups[apiBodyId]);
                }
                globalParam["LoginUId"] = loginUser.UId;
                var result = await HiApiBlockExcute(blockInfo, paramList, globalParam, blockResultMap);
                if (blockInfo.OutResult)
                {
                    resp.Tables[blockInfo.BlockName] = result;
                }
                blockResultMap[apiBodyId] = result.Table.Select(r => (IDictionary<string, object>)r).ToList();
                index++;
            }, 1);
            return resp;
        }

        /// <summary>
        /// 参数匹配正则
        /// (or |and ){0,1}[a-zA-Z\.]{1,}\s{0,}(=|in)\s{0,}((\(\s{0,}'{0,1}\@([a-zA-Z\.0-9]*)'{0,1}\s{0,}\)\s{0,})|('{0,1}\@([a-zA-Z\\.0-9]*)'{0,1}))
        /// </summary>
        static readonly Regex ParamReg = new Regex(
             "(or |and ){0,1}[a-zA-Z\\.]{1,}\\s{0,}(=|in)\\s{0,}((\\(\\s{0,}\'{0,1}\\@([a-zA-Z\\.0-9]*)\'{0,1}\\s{0,}\\)\\s{0,})|(\'{0,1}\\@([a-zA-Z\\\\.0-9]*)\'{0,1}))",
            RegexOptions.Singleline | RegexOptions.IgnoreCase);


        /// <summary>
        /// 执行单个逻辑块
        /// </summary>
        /// <param name="blockEntity">逻辑块信息</param>
        /// <param name="paramList">逻辑块参数集合</param>
        /// <param name="globalParam">全局输入参数</param>
        /// <param name="blockResultMap">当前逻辑块之前的逻辑块执行结果</param>
        /// <returns>逻辑块执行结果</returns>
        public async Task<BlockResult> HiApiBlockExcute(
            HiApiBlockSimpleEntity blockEntity,
            List<HiApiParamEntitySimple> paramList,
            IDictionary<string, object> globalParam,
            Dictionary<string, List<IDictionary<string, object>>> blockResultMap)
        {
            var resp = new BlockResult();
            var sql = blockEntity.Sql;
            var sqlParamList = BlockParamSet(blockEntity, paramList, globalParam, blockResultMap);
            var hiSqlParam = sqlParamList.ToDictionary(x => $"{x.Key}", x => x.Value);
            var query = hiSqlParam.Count > 0 ? sqlClient.HiSql(sql, hiSqlParam) : sqlClient.HiSql(sql);
            if (blockEntity.IsPageList)
            {
                int pageIndex = Convert.ToInt32(sqlParamList["PageIndex"]);
                int pageSize = Convert.ToInt32(sqlParamList["PageSize"]);
                query = query.Skip(pageIndex).Take(pageSize);
                int totalCount = 0;
                resp.Table = await query
                .Sort(new SortBy {
                    {blockEntity.OrderByField}
                }).ToEObjectAsync(ref totalCount);
                resp.TotalCount = totalCount;
            }
            else
            {
                resp.Table = await query.ToEObjectAsync();
                resp.TotalCount = resp.Table.Count;
            }
            return resp;
        }



        /// <summary>
        /// 组装逻辑块的参数
        /// </summary>
        /// <param name="blockEntity"></param>
        /// <param name="paramList"></param>
        /// <param name="globalParam"></param>
        /// <param name="blockResultMap"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        private static Dictionary<string, object> BlockParamSet(
            HiApiBlockSimpleEntity blockEntity,
            List<HiApiParamEntitySimple> paramList,
            IDictionary<string, object> globalParam,
            Dictionary<string, List<IDictionary<string, object>>> blockResultMap
            )
        {
            var sqlParamList = new Dictionary<string, object>();
            //参数是集合还是单个值 [=为单个值] [in为集合]
            var paramTypeMap = new Dictionary<string, string>();
            var groups = ParamReg.Matches(blockEntity.Sql);
            foreach (Match item in groups)
            {
                var operateChat = item.Groups[2].Value;
                var paramName = item.Groups[5].Value.ToLower();
                if (operateChat == "=")
                {
                    paramName = item.Groups[7].Value;
                }
                paramTypeMap[paramName] = operateChat;
            }
            if (paramTypeMap.Count > 0)
            {
                paramList.ForEach(r =>
            {
                if (!paramTypeMap.ContainsKey(r.Title))
                {
                    //没有用到的参数直接忽略
                    return;
                }
                var valueIsArray = paramTypeMap[r.Title] == "in";
                var pathArray = r.ValueFrom.Split('.');
                var blockIndex = pathArray[0];
                var propName = pathArray[1];
                if (blockIndex == "0")//全局参数
                {
                    sqlParamList[r.Title] = globalParam[propName];
                }
                else
                {
                    var table = blockResultMap[blockIndex];
                    if (table.Count > 0)
                    {
                        if (valueIsArray)
                        {
                            var values = new List<object>();
                            table.ForEach(rowIedtem =>
                            {
                                values.Add(rowIedtem[r.Title]);
                            });
                            sqlParamList[r.Title] = values;
                        }
                        else
                        {
                            sqlParamList[r.Title] = table.First()[r.Title];
                        }
                    }
                    else
                    {
                        throw new Exception($"{blockEntity.ApiBodyId}缺少参数[{r.Title}]");
                    }
                }
            });
            }
            return sqlParamList;
        }
    }
}