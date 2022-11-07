import { List } from 'linqts';

import { Dictionary } from '@/helper/arrayHelper';

import ApiResultModel from './apiModels/apiResultModel';
import serverApiClient from './httpClient';
import { TableDataAddRequest, TableDataDeleteRequest } from './request';
import {
  CreateExportTaskRequest,
  CreateExportTaskResponse,
  ExportTaskStatusCheckRequest,
  ExportTaskStatusCheckResponse,
} from './request/tableData/createExportTaskRequest';
import { TableDataAddResponse } from './request/tableData/tableDataAddRequest';
import {
  TableDataBatchQueryRequest,
  TableDataBatchQueryResponse,
} from './request/tableData/tableDataBatchQueryRequest';
import { TableDataDeleteResponse } from './request/tableData/tableDataDeleteRequest';
import {
  TableDataQueryRequest,
  TableDataQueryResponse,
} from './request/tableData/tableDataQueryRequest';
import {
  TableDataTransactionOperateRequest as TableDataTranOperateRequest,
  TableDataTransactionOperateResponse as TableDataTranOperateResponse,
} from './request/tableData/tableDataTransactionOperate';
import {
  TableDataUpdateRequest,
  TableDataUpdateResponse,
} from './request/tableData/tableDataUpdateRequest';

/**
 * 删除数据
 * @param tableName 表名
 * @param whereJson 筛选条件
 * @returns
 */
export const tableDataDelete = async (
  tableName: string,
  whereJson: { [key: string]: any },
  isClearTable = false,
) => {
  const url = `hidata/api/data/${tableName}/delete`;
  const req = new TableDataDeleteRequest();
  req.WhereJson = whereJson;
  req.IsClearTable = isClearTable;
  const resp = await serverApiClient.Post<ApiResultModel<TableDataDeleteResponse>>(url, req, {
    IsAuth: false,
  });
  return resp;
};

/**
 * 数据增加
 * @param tableName
 * @param data
 * @returns
 */
export const tableDataAdd = async (tableName: string, datas: Array<{ [key: string]: any }>) => {
  const req = new TableDataAddRequest(tableName, datas);
  const url = `hidata/api/data/${tableName}/add`;
  const resp = await serverApiClient.Post<ApiResultModel<TableDataAddResponse>>(url, req, {
    IsAuth: false,
  });
  return resp;
};

/**
 * 数据更新
 * @param tableName
 * @param setObj
 * @param where
 * @returns
 */
export const tableDataUpdate = async (
  tableName: string,
  setObj: { [key: string]: any },
  where: { [key: string]: any },
) => {
  const req = new TableDataUpdateRequest();
  req.UpdateSet = setObj;
  req.WhereJson = where;
  const url = `hidata/api/data/${tableName}/update`;
  const resp = await serverApiClient.Post<ApiResultModel<TableDataUpdateResponse>>(url, req, {
    IsAuth: false,
  });
  return resp;
};

/**
 * 数据查询
 * @param tableName 要查询的表
 * @param where 查询条件
 * @param option 可选项
 * @returns
 */
export const tableDataQuery = async <T = any>(
  tableName: string,

  option: {
    /**
     * 筛选条件
     */
    where: Dictionary<string, any>;

    whereParam?: Dictionary<string, any>;

    hisqlWhere?: string;

    hisqlParam?: Dictionary<string, any>;

    /**
     * 排序字段
     */
    orderByField: string;
    /**
     * 要查询的字段
     */
    fields?: string;
    /**
     * 页码,从第一页开始,-1为查询所有
     */
    pageIndex?: number;
    /**
     * 页大小上限为50
     */
    pageSize?: number;
    /**
     * 是否去重
     */
    distinct?: boolean;
  },
) => {
  const req = new TableDataQueryRequest();
  req.TableName = tableName;
  req.Fields = option.fields ?? `*`;
  req.PageIndex = option.pageIndex ?? 1;
  req.PageSize = option.pageSize ?? 30;
  req.OrderByField = option.orderByField;
  req.WhereJson = option.where;
  req.HiSqlWhere = option.hisqlWhere ?? ``;
  req.HiSqlWhereParam = option.hisqlParam ?? {};
  req.Distinct = option.distinct ?? false;
  const url = `hidata/api/data/${tableName}/query`;
  return serverApiClient.Post<ApiResultModel<TableDataQueryResponse<T>>>(url, req, {
    IsAuth: false,
  });
};

/**
 * 事物批量操作
 * @param req
 * @returns
 */
export const tableDataTranOperate = async (req: TableDataTranOperateRequest) => {
  const url = `hidata/api/data/tranoperate`;
  return serverApiClient.Post<ApiResultModel<TableDataTranOperateResponse>>(url, req, {
    IsAuth: false,
  });
};

/**
 * 批量查询
 * @param req
 * @returns
 */
export const tableDataBatchQuery = async (req: TableDataBatchQueryRequest) => {
  const url = `hidata/api/data/batchquery`;
  return serverApiClient.Post<ApiResultModel<TableDataBatchQueryResponse>>(url, req, {
    IsAuth: false,
  });
};

/**
 * 创建导出任务
 * @param req
 * @returns
 */
export const createExportTask = async (req: CreateExportTaskRequest) => {
  const url = `hidata/api/data/${req.TableName}/createExportTask`;
  return serverApiClient.Post<ApiResultModel<CreateExportTaskResponse>>(url, req, {
    IsAuth: false,
  });
};

/**
 * 查询任务执行状态
 * @param req
 * @returns
 */
export const exportTaskStatusCheck = async (req: ExportTaskStatusCheckRequest) => {
  const url = `hidata/api/data/checkExportTaskStatus`;
  return serverApiClient.Post<ApiResultModel<ExportTaskStatusCheckResponse>>(url, req, {
    IsAuth: false,
  });
};

export const queryTableField = async (
  tableName: string,
  fieldName: string,
  key: string,
  top: number = 10,
) => {
  console.log(top);
  const req = new TableDataQueryRequest();
  req.Fields = fieldName;
  req.HiSqlWhere = `${fieldName} like @${fieldName}`;
  req.HiSqlWhereParam[fieldName] = `%${key}%`;
  req.PageSize = top;
  req.PageIndex = -1;
  req.Distinct = true; // 去重
  const result = await tableDataQuery(tableName, {
    where: {},
    hisqlWhere: req.HiSqlWhere,
    hisqlParam: req.HiSqlWhereParam,
    orderByField: fieldName,
    fields: fieldName,
    distinct: req.Distinct,
    pageSize: req.PageSize,
    pageIndex: req.PageIndex,
  });
  const groups = new List(result.Data?.List ?? []).GroupBy(r => r[fieldName]);
  return Object.keys(groups);
};
