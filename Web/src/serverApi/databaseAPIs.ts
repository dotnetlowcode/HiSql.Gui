import { Dictionary } from '@/helper/arrayHelper';
import { StringHelper } from '@/helper/stringHelper';
import ApiResultModel from './apiModels/apiResultModel';
import { HiApiExcuteApi } from './hiApiAPIs';
import serverApiClient from './httpClient';
import { HiApiBlockEntity } from './models/tableModel/hiApiBlockEntity';
import { HiApiParamEntity } from './models/tableModel/hiApiFields';
import {
  hiApiBlockTableName,
  HiApiEntity,
  hiApiParamTableName,
  hiApiTableName,
} from './models/tableModel/hiApiModel';
import {
  ApiGetSnowflakeIdRequest,
  ApiGetSnowflakeIdResponse,
} from './request/database/apiGetSnowflakeIdRequest';
import {
  ApiTestExcuteRequest,
  ApiTestExcuteResponse,
} from './request/database/ApiTestExcuteRequest';
import {
  GetTablesRequest,
  GetTablesResponse,
  TableType,
} from './request/database/databaseTableRequest';
import {
  DataBaseVersionRequest,
  DataBaseVersionResponse,
} from './request/database/databaseVersionRequest';
import { TableDataBatchQueryRequest } from './request/tableData/tableDataBatchQueryRequest';
import { TableDataQueryRequest } from './request/tableData/tableDataQueryRequest';
import {
  TableDataTransactionOperateRequest,
  TableOperate,
  TranOperteItem,
} from './request/tableData/tableDataTransactionOperate';
import { tableDataBatchQuery, tableDataTranOperate } from './tableDataAPIs';

/**
 * 获取表信息
 * @param type 0表，1视图
 * @returns
 */
export const getTables = async (type: TableType) => {
  const req = new GetTablesRequest();
  req.Type = type;
  const resp = await serverApiClient.Post<ApiResultModel<GetTablesResponse>>(
    `hidata/database/tables`,
    req,
    { IsAuth: true },
  );
  return resp.Data?.List ?? [];
};

/**
 * 测试API
 * @param hiSql
 * @param params
 * @param option
 * @returns
 */
export const ApiTestExcute = async (
  hiSql: string,
  params: {
    [key: string]: string;
  },
  option?: {
    pageSize?: number;
    pageIndex?: number;
    orderBy?: Dictionary<string, 1 | -1>;
    hiSqlparam: Dictionary<string, any>;
  },
) => {
  const req = new ApiTestExcuteRequest();
  req.HiSql = hiSql;
  req.Params = params;
  req.PageSize = option?.pageSize ?? 0;
  req.PageIndex = option?.pageIndex ?? -1;
  req.HiSqlWhereParam = option?.hiSqlparam ?? {};
  req.OrderByField;
  const resp = await serverApiClient.Post<ApiResultModel<ApiTestExcuteResponse>>(
    `hidata/database/apitestexcute`,
    req,
    { IsAuth: false },
  );
  return resp;
};

/**
 * 获取API 信息
 * @param apiId
 */
export const getApi = async (apiId: string) => {
  const req = new TableDataBatchQueryRequest();
  const apiObjReq = new TableDataQueryRequest();
  apiObjReq.TableName = hiApiTableName;
  apiObjReq.Fields = '*';
  apiObjReq.OrderByField = 'ApiId';
  apiObjReq.WhereJson = {
    ApiId: apiId,
  };
  req.Querys.push(apiObjReq);
  // ----------------------
  const apiBlockReq = new TableDataQueryRequest();
  apiBlockReq.TableName = hiApiBlockTableName;
  apiBlockReq.Fields = '*';
  apiBlockReq.OrderByField = 'ApiBodyId';
  apiBlockReq.WhereJson = {
    ApiId: apiId,
  };
  req.Querys.push(apiBlockReq);
  // ----------------------
  const apiParamReq = new TableDataQueryRequest();
  apiParamReq.TableName = hiApiParamTableName;
  apiParamReq.Fields = '*';
  apiParamReq.OrderByField = 'ApiBodyId';
  apiParamReq.WhereJson = {
    ApiId: apiId,
  };
  req.Querys.push(apiParamReq);
  const resp = await tableDataBatchQuery(req);
  const tables = resp.Data?.Tables ?? [];
  const apiObj: HiApiEntity = tables[0].List[0];
  const apiBlocks: Array<HiApiBlockEntity> = tables[1].List;
  const apiParams: Array<HiApiParamEntity> = tables[2].List;
  return {
    apiObj,
    apiBlocks,
    apiParams,
  };
};

/**
 * 保存API信息
 * @param req
 * @returns
 */
export const ApiSave = async (
  obj: HiApiEntity,
  blocks: Array<HiApiBlockEntity>,
  fields: Array<HiApiParamEntity>,
) => {
  const isAdd = !obj.ApiId;
  const req = new TableDataTransactionOperateRequest();
  if (isAdd) {
    obj.ApiId = StringHelper.genGuid();
    const addOperateItem = new TranOperteItem(hiApiTableName, TableOperate.Add);
    addOperateItem.AddDatas = [obj];
    req.Operates.push(addOperateItem);
  } else {
    const operateItem = new TranOperteItem(hiApiTableName, TableOperate.Update);
    operateItem.UpdateSet = obj;
    operateItem.WhereJson = {
      ApiId: obj.ApiId,
    };
    const deleteBlock = new TranOperteItem(hiApiBlockTableName, TableOperate.Delete);
    deleteBlock.WhereJson = {
      ApiId: obj.ApiId,
    };
    const deleteParam = new TranOperteItem(hiApiParamTableName, TableOperate.Delete);
    deleteParam.WhereJson = {
      ApiId: obj.ApiId,
    };
    req.Operates.push(operateItem, deleteBlock, deleteParam);
  }
  // Block操作
  const blocksOperateItem = new TranOperteItem<HiApiBlockEntity>(
    hiApiBlockTableName,
    TableOperate.Add,
  );
  blocks.forEach(r => {
    r.ApiId = obj.ApiId;
  });
  blocksOperateItem.AddDatas = blocks;
  req.Operates.push(blocksOperateItem);

  // Param操作
  fields.forEach(r => {
    r.ApiId = obj.ApiId;
  });
  const paramFieldsOperateItem = new TranOperteItem<HiApiParamEntity>(
    hiApiParamTableName,
    TableOperate.Add,
  );
  paramFieldsOperateItem.AddDatas = fields;
  req.Operates.push(paramFieldsOperateItem);
  const resp = await tableDataTranOperate(req);
  return resp;
};

/**
 * 获取API分组
 * @returns
 */
export const getApiGroup = async () => {
  const result = await HiApiExcuteApi(`a7bd1c62-f948-40b9-88f1-cb6e83352e59`, {});
  return result.ApiGroup.Table as Array<{
    GroupName: string;
  }>;
};

/**
 * 加载API列表
 * @returns
 */
export const getApiList = async () => {
  const result = await HiApiExcuteApi(`eff802a9-4b94-4b36-9cb5-2ea368b44762`, {});
  return result.GroupApi.Table as Array<{
    Name: string;
    Sort: number;
    ApiId: string;
    GroupName: string;
  }>;
};

/**
 * 获取数据库版本号
 * @returns
 */
export const getDatabaseVersion = async () => {
  const req = new DataBaseVersionRequest();
  const resp = await serverApiClient.Post<ApiResultModel<DataBaseVersionResponse>>(
    'hidata/version',
    req,
    {
      IsAuth: true,
    },
  );
  return resp;
};

/**
 * 获取雪花Id
 * @param count
 * @returns
 */
export const getSnowflakeId = async (count = 1) => {
  const req = new ApiGetSnowflakeIdRequest(count);
  const resp = await serverApiClient.Post<ApiResultModel<ApiGetSnowflakeIdResponse>>(
    'hidata/getSnowflakeId',
    req,
    {
      IsAuth: true,
    },
  );
  return resp.Data?.SnowflakeIds ?? [];
};
