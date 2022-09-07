import { Dictionary } from '@/helper/arrayHelper';
import { StringHelper } from '@/helper/stringHelper';
import { HiChartEntity } from './models/chartModel/HiChartEntity';
import { HiChartFieldEntity } from './models/chartModel/HiChartFieldEntity';
import { HiChartDashboardEntity } from './models/chartModel/HiDashboardEntity';
import { TableDataBatchQueryRequest } from './request/tableData/tableDataBatchQueryRequest';
import { TableDataQueryRequest } from './request/tableData/tableDataQueryRequest';
import {
  TableDataTransactionOperateRequest,
  TableOperate,
  TranOperteItem,
} from './request/tableData/tableDataTransactionOperate';
import { TableDataUpdateRequest } from './request/tableData/tableDataUpdateRequest';
import {
  tableDataBatchQuery,
  tableDataQuery,
  tableDataTranOperate,
  tableDataUpdate,
} from './tableDataAPIs';

const hiChartDashboardTableName = `Hi_ChartDashboard`;
const hiChartTableName = `Hi_Chart`;
const hiChartFieldTableName = `Hi_ChartField`;

export class ChartSaveResult {
  ChartId = ``;

  IsAdd = false;

  IsOk = false;
}

export class GridLayoutItem {
  constructor(chartId: string) {
    this.i = chartId;
  }

  /**
   * X坐标
   */
  x = 0;

  /**
   * Y坐标
   */
  y = 0;

  /**
   * 宽度
   */
  w = 0;

  /**
   * 高度
   */
  h = 0;

  /**
   * 索引,ChartId
   */
  i = ``;
}

/**
 * 保存报表参数
 * @param charObj
 * @param charFields
 * @returns
 */
export const saveChartInfo = async (
  charObj: HiChartEntity,
  charFields: Array<HiChartFieldEntity>,
  extJson: Dictionary<string, any> = {},
) => {
  let isAdd = false;
  if (!charObj.ChartId) {
    isAdd = true;
    charObj.ChartId = StringHelper.genGuid();
  }
  charObj.ExtJson = JSON.stringify(extJson);
  const tranOperateReq = new TableDataTransactionOperateRequest();
  // main
  const mainOperate = new TranOperteItem(
    hiChartTableName,
    isAdd ? TableOperate.Add : TableOperate.Update,
  );
  if (isAdd) {
    mainOperate.AddDatas = [charObj];
  } else {
    mainOperate.UpdateSet = charObj;
    mainOperate.WhereJson = {
      ChartId: charObj.ChartId,
    };
  }
  tranOperateReq.Operates.push(mainOperate);
  ///
  if (!isAdd) {
    const delFieldsOperate = new TranOperteItem(hiChartFieldTableName, TableOperate.Delete);
    delFieldsOperate.WhereJson = {
      ChartId: charObj.ChartId,
    };
    tranOperateReq.Operates.push(delFieldsOperate);
  }
  const addChartFieldsOperate = new TranOperteItem(hiChartFieldTableName, TableOperate.Add);
  charFields.forEach(fieldObj => {
    fieldObj.ChartId = charObj.ChartId;
    fieldObj.FieldId = StringHelper.genGuid();
    addChartFieldsOperate.AddDatas.push(fieldObj);
  });
  tranOperateReq.Operates.push(addChartFieldsOperate);
  const result = await tableDataTranOperate(tranOperateReq);
  const saveResult = new ChartSaveResult();
  saveResult.ChartId = charObj.ChartId;
  saveResult.IsAdd = isAdd;
  saveResult.IsOk = (result.Data?.AddCount ?? 0) > 0;
  return saveResult;
};

/**
 * 获取报表参数
 */
export const getChartInfo = async (chartId: string) => {
  const req = new TableDataBatchQueryRequest();
  const mainQuery = new TableDataQueryRequest();
  mainQuery.Fields = '*';
  mainQuery.WhereJson = {
    ChartId: chartId,
  };
  mainQuery.TableName = hiChartTableName;
  req.Querys.push(mainQuery);
  const chartFieldsQuery = new TableDataQueryRequest();
  chartFieldsQuery.Fields = '*';
  chartFieldsQuery.TableName = hiChartFieldTableName;
  chartFieldsQuery.WhereJson = {
    ChartId: chartId,
  };
  req.Querys.push(chartFieldsQuery);
  const queryResult = await tableDataBatchQuery(req);
  if (queryResult.Data?.Tables.length !== 2) {
    throw `数据获取失败!`;
  }
  const [chartObjList, chartFieldList] = queryResult.Data?.Tables ?? [];
  return {
    charObj: chartObjList.List[0] as HiChartEntity,
    charFields: chartFieldList.List as Array<HiChartFieldEntity>,
  };
};

/**
 * 获取Dashboard信息
 * @param where
 * @returns
 */
export const getDashboardInfo = async (where: { dashboardId?: string; tableName?: string }) => {
  const req = new TableDataBatchQueryRequest();
  const mainQuery = new TableDataQueryRequest();
  mainQuery.Fields = '*';
  if (where.dashboardId) {
    mainQuery.WhereJson = {
      DBId: where.dashboardId,
    };
  } else if (where.tableName) {
    mainQuery.WhereJson = {
      TableName: where.tableName,
    };
  } else {
    throw `Where条件不能为空!`;
  }
  mainQuery.TableName = hiChartDashboardTableName;
  req.Querys.push(mainQuery);
  const queryResult = await tableDataBatchQuery(req);
  if (queryResult.Data?.Tables.length !== 1) {
    throw `数据获取失败!`;
  }
  if (queryResult.Data.Tables[0].List.length < 1) {
    return undefined;
  }
  return queryResult.Data.Tables[0].List[0] as HiChartDashboardEntity;
};

export const saveDashboardInfo = async (dashboardInfo: HiChartDashboardEntity) => {
  let isAdd = false;
  if (!dashboardInfo.DBId) {
    dashboardInfo.DBId = StringHelper.genGuid();
    isAdd = true;
  }
  const tranOperateReq = new TableDataTransactionOperateRequest();
  // main
  const mainOperate = new TranOperteItem(
    hiChartDashboardTableName,
    isAdd ? TableOperate.Add : TableOperate.Update,
  );
  mainOperate.AddDatas = [dashboardInfo];
  tranOperateReq.Operates.push(mainOperate);
  const result = await tableDataTranOperate(tranOperateReq);
  if ((result.Data?.AddCount ?? 0) > 0) {
    return true;
  }
  return false;
};

export const getTableDashboard = async (tableName: string) => {
  let entity = await getDashboardInfo({
    tableName,
  });
  if (!entity) {
    entity = new HiChartDashboardEntity();
    entity.TableName = tableName;
    entity.CreateTime = new Date();
    entity.ModiTime = new Date();
    entity.Title = `${tableName}Dashboard报表`;
    await saveDashboardInfo(entity);
  }
  return entity;
};

export const getDashboardCharts = async (dashboardId: string) => {
  const queryResult = await tableDataQuery(
    hiChartTableName,
    {
      DBId: dashboardId,
    },
    'DBId',
    {
      fields: 'ChartId,Position',
    },
  );
  const chartInfos = queryResult.Data?.List as Array<HiChartEntity>;
  const chartIds: Array<{
    ChartId: string;
    Position: string;
  }> = [];
  chartInfos.forEach(r => {
    chartIds.push({
      ChartId: r.ChartId,
      Position: r.Position,
    });
  });
  return chartIds;
};

/**
 * 保存图表位置信息
 * @param positionObj
 */
export const saveChartPosition = async (chartId: string, positionObj: GridLayoutItem) => {
  const updateResult = await tableDataUpdate(
    hiChartTableName,
    {
      Position: JSON.stringify(positionObj),
    },
    {
      ChartId: chartId,
    },
  );
  return (updateResult.Data?.ModifyCount ?? 0) > 0;
};

/**
 * 删除报表
 * @param chartId
 * @returns
 */
export const deleteChartInfo = async (chartId: string) => {
  const tranOperateReq = new TableDataTransactionOperateRequest();
  const delChartInfo = new TranOperteItem(hiChartTableName, TableOperate.Delete);
  delChartInfo.WhereJson = {
    ChartId: chartId,
  };
  const delChartFields = new TranOperteItem(hiChartFieldTableName, TableOperate.Delete);
  delChartFields.WhereJson = {
    ChartId: chartId,
  };
  tranOperateReq.Operates.push(delChartInfo, delChartFields);
  const resp = await tableDataTranOperate(tranOperateReq);
  return (resp.Data?.DeleteCount ?? 0) > 0;
};
