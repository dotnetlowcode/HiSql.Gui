import { Dictionary } from '@/helper/arrayHelper';
import ApiResultModel from './apiModels/apiResultModel';
import { TableInfo } from './apiModels/tableInfoModel';
import serverApiClient from './httpClient';
import { ColumnStruct } from './models/columnStruct';
import { HiTable } from './models/tableProps';
import { TableDataRequest } from './request';
import { TableGetColumnsRequest, TableGetColumnsResponse } from './request/table/tableGetColums';
import {
  TableIndexCreateRequest,
  TableIndexCreateResponse,
} from './request/table/tableIndexCreateRequest';
import {
  TableIndexDeleteRequest,
  TableIndexDeleteResponse,
} from './request/table/tableIndexDeleteRequest';
import { TableIndexsReqeust, TableIndexsResponse } from './request/table/tableIndexRequest';
import {
  TableInfoSaveRequest,
  TableInfoSaveResponse,
  TableSaveOperateLevel,
} from './request/table/tableInfoSaveRequest';
import {
  TableViewCreateRequest,
  TableViewCreateResponse,
} from './request/table/tableViewCreateRequest';
import {
  TableDataQueryRequest,
  TableDataQueryResponse,
} from './request/tableData/tableDataQueryRequest';
import {
  TableDataTransactionOperateRequest,
  TableOperate,
  TranOperteItem,
} from './request/tableData/tableDataTransactionOperate';
import { tableDataQuery, tableDataTranOperate } from './tableDataAPIs';

export const apiError = `加载数据出错!`;
const hiFieldMapTableName = `Hi_FieldMap`;
export const getTableInfo = async (tableName = 'Hi_TabModel') => {
  const result = await serverApiClient.Post<ApiResultModel<TableInfo>>(
    `hidata/table/${tableName}/get`,
    {},
    { IsAuth: false },
  );
  if (result.Data?.TabColumns) {
    for (const key in result.Data.TabColumns) {
      if (Object.prototype.hasOwnProperty.call(result.Data.TabColumns, key)) {
        const element = result.Data.TabColumns[key];
        element.ReFieldName = element.FieldName;
      }
    }
  }
  return result;
};

/**
 * 获取表列信息
 * @param request
 * @returns
 */
export const getTableColumns = async (request: TableGetColumnsRequest) => {
  const result = await serverApiClient.Post<ApiResultModel<TableGetColumnsResponse>>(
    `hidata/table/${request.TableName}/getColumns`,
    request,
    { IsAuth: false },
  );
  return result;
};

// export const saveTableRowData = async (reqeust: TableDataAddRequest) => {
//   const result = await serverApiClient.Post(`hidata/table/${reqeust.TableName}/saveRow`, reqeust, {
//     IsAuth: false,
//   });
//   return result;
// };

export const deleteTableInfo = async (tableName = 'Hi_TabModel') => {
  const result = await serverApiClient.Post(
    `hidata/table/${tableName}/delete`,
    {},
    { IsAuth: false },
  );
  return result;
};

/**
 * 获取表数据
 * @param reqeust
 * @returns
 */
export const tableData = async <T = any>(reqeust: TableDataQueryRequest) => {
  if (reqeust.WhereJson) {
    for (const key in reqeust.WhereJson) {
      if (Object.prototype.hasOwnProperty.call(reqeust.WhereJson, key)) {
        if (reqeust.WhereJson[key] === '') {
          delete reqeust.WhereJson[key];
        }
      }
    }
  }
  const result = await serverApiClient.Post<ApiResultModel<TableDataQueryResponse<T>>>(
    `hidata/table/${reqeust.TableName}/data`,
    reqeust,
    {
      IsAuth: false,
    },
  );
  return result;
};

const tabModelTableName = `Hi_TabModel`;

export class TablePropEntity {
  TabName = ``;

  TabReName = ``;

  TabDescript = ``;

  TabStoreType = ``;

  TabType = ``;

  TabCacheType = ``;

  TabStatus = ``;
}

const tablePropFields = Object.keys(new TablePropEntity()).join(`,`);

/**
 * 获取表属性
 * @param tableName 表名
 * @returns
 */
export const getTableProp = async (tableName: string) => {
  const req = new TableDataQueryRequest();
  req.TableName = tabModelTableName;
  req.Fields = tablePropFields;
  req.PageIndex = -1;
  req.WhereJson = {
    TabName: tableName,
  };
  const { Data: data } = await tableData(req);
  if (data && data.List.length > 0) {
    return data.List[0] as TablePropEntity;
  }
  throw apiError;
};

/**
 * 获取表索引集合
 * @param tableName
 * @returns
 */
export const getTableIndex = async (tableName: string) => {
  const req = new TableIndexsReqeust();
  const resp = await serverApiClient.Post<ApiResultModel<TableIndexsResponse>>(
    `hidata/table/${tableName}/indexs`,
    req,
    { IsAuth: false },
  );
  return resp.Data?.List ?? [];
};

/**
 * 删除索引
 * @param tableName 表名
 * @param indexName 索引名
 * @returns
 */
export const deleteTableIndex = async (tableName: string, indexName: string) => {
  const req = new TableIndexDeleteRequest();
  req.IndexName = indexName;
  const resp = await serverApiClient.Post<ApiResultModel<TableIndexDeleteResponse>>(
    `hidata/table/${tableName}/index/delete`,
    req,
    { IsAuth: false },
  );
  return resp.Data;
};

/**
 * 创建索引
 * @param tableName
 * @returns
 */
export const createTableIndex = async (
  tableName: string,
  indexName: string,
  columns: ColumnStruct[],
) => {
  const req = new TableIndexCreateRequest();
  req.IndexName = indexName;
  req.Columns = columns;
  const resp = await serverApiClient.Post<ApiResultModel<TableIndexCreateResponse>>(
    `hidata/table/${tableName}/index/create`,
    req,
    { IsAuth: false },
  );
  return resp.Data;
};

/**
 * 保存表或更新表结构信息
 */
export const saveTableInfo = async (
  tabProps: HiTable,
  tabColumnStruct: ColumnStruct[],
  isView = false,
) => {
  debugger;
  tabColumnStruct.forEach(r => {
    r.SNO_NUM = (r.SNO_NUM ?? '').trim();
    r.SNO = r.SNO.trim();
    if (!r.TabName) {
      r.TabName = tabProps.TabName;
    }
    if (r.RefField === undefined) {
      r.ReFieldName = r.FieldName; // 新建字段
    } else if (r.ReFieldName !== '' && r.FieldName !== r.ReFieldName) {
      // 字段重命名
      const newName = r.FieldName;
      r.FieldName = r.ReFieldName;
      r.ReFieldName = newName;
    }
  });
  const req = new TableInfoSaveRequest(tabProps, tabColumnStruct);
  req.OPLevel = TableSaveOperateLevel.Execute;
  req.IsView = isView;
  debugger;
  const resp = await serverApiClient.Post<ApiResultModel<TableInfoSaveResponse>>(
    `hidata/table/${tabProps.TabName}/save`,
    req,
    {
      IsAuth: false,
    },
  );
  return resp.Data;
};

/**
 * 获取表描述信息
 * @param tableName
 * @returns
 */
export const getTableSimple = async (tableName: string) => {
  const req = new TableDataRequest();
  req.Fields = 'TabDescript';
  req.WhereJson = {
    TabName: tableName,
  };
  req.TableName = tabModelTableName;
  const result = await tableData<{
    TabDescript: string;
  }>(req);
  const dataList = result.Data?.List ?? [];
  if (dataList.length === 0) {
    return undefined;
  }
  const [firstObj] = dataList;
  return firstObj;
};

/**
 * 创建视图
 * @param tableName
 * @param sql
 * @returns
 */
export const createTableView = async (tableName: string, sql: string) => {
  const req = new TableViewCreateRequest();
  req.Sql = sql;
  req.TableName = tableName;
  const resp = await serverApiClient.Post<ApiResultModel<TableViewCreateResponse>>(
    `hidata/tableView/${req.TableName}/create`,
    req,
    {
      IsAuth: false,
    },
  );
  return resp.Data?.IsOk ?? false;
};

export type FieldMapType = 'Table' | 'TableView' | 'Chart';
export class HiFieldMapEntity {
  /**
   * 字段名[必填参数]
   */
  FieldKey = '';

  /**
   * 映射值
   */
  FieldValue = '';

  /**
   * 字典类型[必填参数]
   */
  Type = '';

  /**
   * 资源Id[必填参数]
   */
  ResId = '';
}

/**
 * 获取资源字典
 * @param respId
 * @param type
 * @returns
 */
export const getFieldMap = async (respId: string, type: FieldMapType) => {
  return tableDataQuery<HiFieldMapEntity>(
    hiFieldMapTableName,
    {
      Type: type,
      ResId: respId,
    },
    'FieldKey',
  );
};

/**
 * 保存映射字典
 * @param respId
 * @param fields
 * @param type
 * @returns
 */
export const saveFieldMap = async (
  respId: string,
  fields: Dictionary<string, string>,
  type: FieldMapType,
) => {
  const dataArray: Array<HiFieldMapEntity> = [];
  for (const fieldName in fields) {
    const fieldMapValue = fields[fieldName];
    const fieldMapObj = new HiFieldMapEntity();
    fieldMapObj.FieldKey = fieldName;
    fieldMapObj.FieldValue = fieldMapValue;
    fieldMapObj.Type = type;
    fieldMapObj.ResId = respId;
    dataArray.push(fieldMapObj);
  }
  const req = new TableDataTransactionOperateRequest();
  // 删除原来的
  req.Operates.push(
    new TranOperteItem(hiFieldMapTableName, TableOperate.Delete, {
      WhereJson: {
        Type: type,
        ResId: respId,
      },
    }),
  );
  // 新增新的
  req.Operates.push(
    new TranOperteItem(hiFieldMapTableName, TableOperate.Add, {
      AddDatas: dataArray,
    }),
  );
  return tableDataTranOperate(req);
};
