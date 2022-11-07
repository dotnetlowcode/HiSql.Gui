import { List } from 'linqts';

import { Dictionary } from '@/helper/arrayHelper';
import config from '@/serverApi/config';
import serverApiClient from '@/serverApi/httpClient';
import { CreateExportTaskRequest } from '@/serverApi/request/tableData/createExportTaskRequest';
import {
  TableDataTransactionOperateRequest,
  TableOperate,
  TranOperteItem,
} from '@/serverApi/request/tableData/tableDataTransactionOperate';
import {
  createExportTask,
  tableDataAdd,
  tableDataDelete,
  tableDataTranOperate,
  tableDataUpdate,
} from '@/serverApi/tableDataAPIs';

import { searchParamToWhereJson } from '../../serverApi/dataHelper';
import { ColumnStruct, fieldSortFun } from '../../serverApi/models/columnStruct';
import { TableDataRequest } from '../../serverApi/request';
import { TableGetColumnsRequest } from '../../serverApi/request/table/tableGetColums';
import { apiError, getFieldMap, getTableColumns, tableData } from '../../serverApi/tableInfoAPIs';

export type exportType = 'template' | 'currentData' | 'allData';
export type ImportExcelResult = {
  UpdateCount: number;
};
export default class TableDetailViewModel {
  tableName: string;

  tabColumnStruct: List<ColumnStruct> = new List();

  constructor(tableName: string, private isViewTalbe: boolean) {
    this.tableName = tableName;
  }

  fieldKeyMap: Dictionary<string, string> = {};

  /**
   * 加载表数据信息
   */
  async loadTableInfo() {
    const req = new TableGetColumnsRequest();
    req.TableName = this.tableName;
    const { Data: fieldMapData } = await getFieldMap(
      this.tableName,
      this.isViewTalbe ? 'TableView' : 'Table',
    );
    if (fieldMapData) {
      fieldMapData.List.forEach(r => {
        this.fieldKeyMap[r.FieldKey] = r.FieldValue;
      });
    }
    const { Data: data } = await getTableColumns(req);
    if (!data) {
      throw apiError;
    }
    if (data.TabColumnStruct.length < 1) {
      throw `加载表结构信息失败!`;
    }
    data.TabColumnStruct?.sort(fieldSortFun);
    this.tabColumnStruct = new List(data.TabColumnStruct);
    const primaryObj = this.tabColumnStruct.OrderByDescending(r => r.IsPrimary).FirstOrDefault();
    this.orderByField = primaryObj.FieldName;
  }

  /**
   * 数据加载排序列
   */
  private orderByField = ``;

  /**
   * 数据加载查询列
   */
  private fileds = `*`;

  async loadTableData(option: { pageSize?: number; pageIndex?: number }) {
    const req = new TableDataRequest();
    req.TableName = this.tableName;
    req.PageSize = option.pageSize ?? 30;
    req.Fields = this.fileds;
    req.PageIndex = option.pageIndex ?? 1;
    if (req.PageIndex < 1) {
      req.PageIndex = 1;
    }
    if (req.PageIndex < 0) {
      req.PageIndex = 0;
    }
    req.OrderByField = this.orderByField;
    req.WhereJson = this.searchParamObj;
    req.HiSqlWhere = this.searchHiParamObj.HisqlWhere;
    req.HiSqlWhereParam = this.searchHiParamObj.HiSqlWhereParam;
    const { Data: data } = await tableData(req);
    return data;
  }

  /**
   * 过滤条件
   */
  searchParamObj: { [key: string]: any } = {};

  /**
   * hisql过滤
   */
  searchHiParamObj: {
    HisqlWhere: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    HiSqlWhereParam: Object;
  } = {
    HisqlWhere: ``,
    HiSqlWhereParam: {},
  };

  /**
   * 搜索组件
   */
  searchFrom: any;

  /**
   * 搜索组件
   */
  whereTableV2: any;

  /**
   * 设置搜索参数
   * @param searchParam
   * @returns
   */
  async setSearchData(searchParam: { [key: string]: any }) {
    this.searchParamObj = searchParamToWhereJson(this.tabColumnStruct.ToArray(), searchParam);
  }

  /**
   * 删除行数据
   * @param columnData
   * @returns
   */
  deleteDataColumn(columnData: any) {
    const whereJson: { [key: string]: any } = {};
    this.tabColumnStruct.ForEach(r => {
      if (r?.IsPrimary) {
        whereJson[r.FieldName] = columnData[r.FieldName];
      }
    });
    return tableDataDelete(this.tableName, whereJson);
  }

  async batchDeleteColumn(columnDatas: Array<any>) {
    const req = new TableDataTransactionOperateRequest();
    columnDatas.forEach(r => {
      const whereJson: { [key: string]: any } = {};
      this.tabColumnStruct.ForEach(bR => {
        if (bR?.IsPrimary) {
          whereJson[bR.FieldName] = r[bR.FieldName];
        }
      });
      const operateItem = new TranOperteItem(this.tableName, TableOperate.Delete);
      operateItem.WhereJson = whereJson;
      req.Operates.push(operateItem);
    });
    const deleteResult = await tableDataTranOperate(req);
    return (deleteResult.Data?.DeleteCount ?? 0) > 0;
  }

  /**
   * 初始化上传头部
   * @returns
   */
  GetPostHeader(): Dictionary<string, string> {
    return {
      Authorization: serverApiClient.Token,
    };
  }

  /**
   * excel上传并导入地址
   */
  get PostUrl() {
    return `${config.ApiConfig.ApiHost}/hidata/api/data/${this.tableName}/excelImport`;
  }

  async SaveTableData(columnData: Dictionary<string, any>, isAddColumn: boolean) {
    if (isAddColumn) {
      const addResult = await tableDataAdd(this.tableName, [columnData]);
      if (addResult.StatusCode === 0) {
        return true;
      }
      throw addResult.ErrorMessage;
    }
    const whereJson: { [key: string]: any } = {};
    this.tabColumnStruct.ForEach(r => {
      if (r?.IsPrimary) {
        whereJson[r.FieldName] = columnData[r.FieldName];
      }
    });
    const updateResult = await tableDataUpdate(this.tableName, columnData, whereJson);
    if (updateResult.StatusCode === 0) {
      return true;
    }
    throw updateResult.ErrorMessage;
  }

  /**
   * 导出查询数据
   */
  async ExportQueryData(type: exportType) {
    const req = new CreateExportTaskRequest();
    req.TableName = this.tableName;
    if (type === 'template') {
      // 导出空模板
      req.IsNullTemplate = true;
    } else if (type === 'currentData') {
      // 导出条件数据
      req.WhereJson = this.searchParamObj;
      req.HiSqlWhere = this.searchHiParamObj.HisqlWhere;
      req.HiSqlWhereParam = this.searchHiParamObj.HiSqlWhereParam;
    }
    req.PageSize = -1;
    req.Fields = this.fileds;
    req.OrderByField = this.orderByField;
    const resp = await createExportTask(req);
    console.log(resp.Data);
    return resp.Data?.TaskId ?? ``;
  }

  /**
   * 清空表
   * @returns
   */
  async ClearTable() {
    const deleteResult = await tableDataDelete(this.tableName, {}, true);
    return deleteResult.StatusCode === 200;
  }
}
