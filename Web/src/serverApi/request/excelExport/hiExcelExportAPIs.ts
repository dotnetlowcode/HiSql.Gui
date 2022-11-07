import ApiResultModel from '@/serverApi/apiModels/apiResultModel';
import serverApiClient from '@/serverApi/httpClient';
import { HiExcelExportTemplateEntity } from '@/serverApi/models/excelModel/HiExcelExportTemplateEntity';
import { HiExcelHeaderMapEntity } from '@/serverApi/models/excelModel/HiExcelHeaderMapEntity';
import { HiExcelTemplateSheetEntity } from '@/serverApi/models/excelModel/HiExcelTemplateSheetEntity';
import {
  tableDataBatchQuery,
  tableDataQuery,
  tableDataTranOperate,
} from '@/serverApi/tableDataAPIs';
import { UploadResult } from '@/views/hisql/exportExcel/exportExcelViewModel';
import { TableDataBatchQueryRequest } from '../tableData/tableDataBatchQueryRequest';
import { TableDataQueryRequest } from '../tableData/tableDataQueryRequest';
import {
  TableDataTransactionOperateRequest,
  TableOperate,
  TranOperteItem,
} from '../tableData/tableDataTransactionOperate';

/**
 * Excel模板导出表名
 */
export const HiExcelExportTemplateTableName = 'Hi_ExcelExportTemplate';

/**
 * Excel模板列映射表名
 */
export const HiExcelHeaderMapTableName = 'Hi_ExcelHeaderMap';

/**
 * Excel模板Sheet配置表名
 */
export const HiExcelTemplateSheetTableName = 'Hi_ExcelTemplateSheet';

export class SaveExcelExportRequest {}
export class SaveExcelExportResponse {}

/**
 * 保存Excel数据模板
 * @param mainObj
 * @param sheetEntityList
 * @param sheetHeaderMapList
 * @param isAdd 是否是新增模式
 */
export const SaveExcelExport = async (
  mainObj: HiExcelExportTemplateEntity,
  sheetEntityList: Array<HiExcelTemplateSheetEntity>,
  sheetHeaderMapList: Array<HiExcelHeaderMapEntity>,
  isAdd = false,
) => {
  const tranOperateReq = new TableDataTransactionOperateRequest();
  // main
  const mainOperate = new TranOperteItem(
    HiExcelExportTemplateTableName,
    isAdd ? TableOperate.Add : TableOperate.Update,
  );
  if (isAdd) {
    mainOperate.AddDatas = [mainObj];
  } else {
    mainOperate.UpdateSet = mainObj;
    mainOperate.WhereJson = {
      TemplateId: mainObj.TemplateId,
    };
  }
  tranOperateReq.Operates.push(mainOperate);
  // sheets,先删除后新增
  const sheetDelOperate = new TranOperteItem(HiExcelTemplateSheetTableName, TableOperate.Delete);
  sheetDelOperate.WhereJson = {
    TemplateId: mainObj.TemplateId,
  };
  tranOperateReq.Operates.push(sheetDelOperate);
  const sheetAddOperate = new TranOperteItem(HiExcelTemplateSheetTableName, TableOperate.Add);
  sheetAddOperate.AddDatas = sheetEntityList;
  tranOperateReq.Operates.push(sheetAddOperate);
  // sheetMaps,先删除后新增
  const sheetMapDelOperate = new TranOperteItem(HiExcelHeaderMapTableName, TableOperate.Delete);
  sheetMapDelOperate.WhereJson = {
    TemplateId: mainObj.TemplateId,
  };
  tranOperateReq.Operates.push(sheetMapDelOperate);
  const sheetMapAddOperate = new TranOperteItem(HiExcelHeaderMapTableName, TableOperate.Add);
  sheetMapAddOperate.AddDatas = sheetHeaderMapList;
  tranOperateReq.Operates.push(sheetMapAddOperate);
  const resp = await tableDataTranOperate(tranOperateReq);
  return resp;
};

export const GetExcelInfo = async (url: string) => {
  const req = {
    urlPath: url,
  };
  const result = await serverApiClient.Post<ApiResultModel<UploadResult>>(
    `hidata/api/excel/getUpExcelInfo`,
    req,
    {
      IsAuth: true,
    },
  );
  if (!result.Data) {
    throw `文件信息不存在!`;
  }
  return result.Data;
};

/**
 * 获取Excel模板信息
 */
export const GetExcelExport = async (templateId: string) => {
  const req = new TableDataBatchQueryRequest();
  const queryA = new TableDataQueryRequest();
  queryA.Fields = '*';
  queryA.TableName = 'Hi_ExcelExportTemplate';
  queryA.WhereJson = {
    TemplateId: templateId,
  };
  queryA.PageIndex = -1; // 获取所有数据6
  req.Querys.push(queryA);
  const queryB = new TableDataQueryRequest();
  queryB.Fields = '*';
  queryB.TableName = 'Hi_ExcelTemplateSheet';
  queryB.WhereJson = {
    TemplateId: templateId,
  };
  queryB.PageIndex = -1; // 获取所有数据
  req.Querys.push(queryB);
  const queryC = new TableDataQueryRequest();
  queryC.Fields = '*';
  queryC.TableName = 'Hi_ExcelHeaderMap';
  queryC.WhereJson = {
    TemplateId: templateId,
  };
  queryC.PageIndex = -1; // 获取所有数据
  req.Querys.push(queryC);
  const resp = await tableDataBatchQuery(req);
  if (!resp.Data?.Tables) {
    throw '数据不存在!';
  }
  const [excelExportMain, excelExportSheetList, excelExportHeaderMap] = resp.Data.Tables;
  const mainObj = excelExportMain.List[0] as HiExcelExportTemplateEntity;
  const sheetList = excelExportSheetList.List as HiExcelTemplateSheetEntity[];
  const sheetHeaderMap = excelExportHeaderMap.List as HiExcelHeaderMapEntity[];
  return {
    MainObj: mainObj,
    SheetList: sheetList,
    SheetHeaderMap: sheetHeaderMap,
  };
};
/**
 * 获取Excel模板集合
 * @returns
 */
export const GetExcelExportTemplateList = async (fields = 'TemplateId,Title') => {
  const req = new TableDataQueryRequest();
  req.Fields = ``;
  req.OrderByField = 'CreateTime';
  req.TableName = HiExcelExportTemplateTableName;
  const resp = await tableDataQuery<HiExcelExportTemplateEntity>(HiExcelExportTemplateTableName, {
    where: {},
    orderByField: 'CreateTime',
    fields,
    pageIndex: -1,
    pageSize: -1,
  });
  return resp.Data?.List ?? [];
};
