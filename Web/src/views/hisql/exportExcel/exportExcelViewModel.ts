import { Dictionary } from '@/helper/arrayHelper';
import { List } from 'linqts';
import config from '@/serverApi/config';
import serverApiClient from '@/serverApi/httpClient';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '@/components/columsTypes/searchFrom/searchFromViewModel';
import { HiExcelExportTemplateEntity } from '@/serverApi/models/excelModel/HiExcelExportTemplateEntity';
import { HiExcelTemplateSheetEntity } from '@/serverApi/models/excelModel/HiExcelTemplateSheetEntity';
import { HiExcelHeaderMapEntity } from '@/serverApi/models/excelModel/HiExcelHeaderMapEntity';
import {
  GetExcelExport,
  GetExcelInfo,
  SaveExcelExport,
} from '@/serverApi/request/excelExport/hiExcelExportAPIs';

export type CellObj = {
  CId: string;
  CellValue: string;
  MapField: string;
  Sort: number;
};
export type SheetTableRow = {
  RId: string;
  Colums: Array<CellObj>;
};
export class SheetData {
  SelectRow: SheetTableRow | null = null;

  SelectRowNumber: number | null = null;

  Rows: SheetTableRow[] = [];

  MpaTableName = ``;

  HeaderMap: Dictionary<string, string> = {};
}

export class UploadResult {
  Path = ``;

  Sheets: Dictionary<string, string> = {};
}

export const SelectTable: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'SourcesTable',
  FieldDesc: '数据表表',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.SingleInput,
  IsRefTab: true,
  RefTab: `Hi_TabModel`,
  RefField: 'TabName',
  RefFields: 'TabName,TabReName,TabDescript',
  RefFieldDesc: '表名,别名,描述',
  RefWhere: '',
});

export class ExportExcelViewModel {
  TemplateId = ``;

  constructor(templateId: string) {
    this.TemplateId = templateId;
  }

  PostUrl = `${config.ApiConfig.ApiHost}/hidata/api/excel/upload`;

  Sheets: Dictionary<string, SheetData> = {};

  /**
   * 当前操作步骤
   */
  CurrentStep = 0;

  /**
   * 当前选中的Sheet
   */
  ActiveSheet = ``;

  IsLoad = true;

  async Init() {
    if (!this.TemplateId) {
      return;
    }
    // 加载数据
    const { MainObj, SheetList, SheetHeaderMap } = await GetExcelExport(this.TemplateId);
    const excelInfo = await GetExcelInfo(MainObj.FileUrl);
    this.SetSheets(excelInfo.Sheets);
    Object.assign(this.MainObj, MainObj);
    const groupSheetMap = new List(SheetHeaderMap).GroupBy(r => r.SheetName);
    SheetList.forEach(sheetObj => {
      const tempSheet = this.Sheets[sheetObj.SheetName];
      tempSheet.SelectRow = tempSheet.Rows[sheetObj.HeaderRowNumber];
      tempSheet.MpaTableName = sheetObj.SourcesTableName;
      tempSheet.SelectRowNumber = sheetObj.HeaderRowNumber;
      const cols = tempSheet.SelectRow?.Colums ?? [];
      groupSheetMap[sheetObj.SheetName].forEach(m => {
        // tempSheet.HeaderMap[m.HeadName] = m.FieldName;
        for (let index = 0; index < cols.length; index++) {
          const element = cols[index];
          if (element.CellValue === m.HeadName) {
            element.MapField = m.FieldName;
            break;
          }
        }
      });
    });
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

  Steps: Array<{
    title: string;
    status: `wait` | `process` | `finish` | `error`;
    icon: string;
  }> = [
    {
      title: `选择Excel`,
      status: `wait`,
      icon: `icon-exportexcel`,
    },
    {
      title: ` 匹配数据表`,
      status: `wait`,
      icon: `icon-dakaiwenjianxingshujuyuan`,
    },
    {
      title: `完成`,
      status: 'finish',
      icon: `icon-wancheng`,
    },
  ];

  SetSheets(excelSheets: Dictionary<string, string>) {
    let i = 0;
    for (const key in excelSheets) {
      if (i === 0) {
        this.ActiveSheet = key;
      }
      i += 1;
      if (Object.prototype.hasOwnProperty.call(excelSheets, key)) {
        const sheetJsonStr = excelSheets[key];
        const obj = JSON.parse(sheetJsonStr) as Array<any>;
        const table: SheetTableRow[] = [];
        for (let rowIndex = 0; rowIndex < obj.length; rowIndex++) {
          const rowObj = obj[rowIndex];
          const columns: Array<CellObj> = [];
          let cId = 0;
          for (const key in rowObj) {
            if (Object.prototype.hasOwnProperty.call(rowObj, key)) {
              const cellStr = rowObj[key];
              columns.push({
                CellValue: cellStr,
                CId: `${rowIndex}${cId}`,
                MapField: ``,
                Sort: cId,
              });
            }
            cId += 1;
          }
          table.push({
            RId: `${rowIndex}`,
            Colums: columns,
          });
        }
        this.Sheets[key] = {
          SelectRow: null,
          SelectRowNumber: null,
          Rows: table,
          MpaTableName: ``,
          HeaderMap: {},
        };
      }
    }
    this.CurrentStep = 1;
  }

  GetTableFieldsStruct(refTableName: string) {
    return ColumnStruct.GetColumnStruct({
      FieldName: 'SourcesTable',
      FieldDesc: '数据表表',
      FieldType: DataBaseType.nvarchar,
      SearchUIModel: SearchUIModelType.SingleInput,
      IsRefTab: true,
      RefTab: `Hi_FieldModel`,
      RefField: 'FieldName',
      RefFields: 'FieldName,FieldDesc',
      RefFieldDesc: '字段名,字段描述',
      RefWhere: `TabName='${refTableName}'`,
    });
  }

  MainObj = new HiExcelExportTemplateEntity();

  async Save() {
    if (this.MainObj.Title.length < 1) {
      throw `请设置模板标题!`;
    }
    const isAdd = !this.TemplateId; // 是否为新增
    const sheetEntityList: Array<HiExcelTemplateSheetEntity> = [];
    const sheetHeaderMapList: Array<HiExcelHeaderMapEntity> = [];
    for (const sheetName in this.Sheets) {
      if (Object.prototype.hasOwnProperty.call(this.Sheets, sheetName)) {
        const sheetObj = this.Sheets[sheetName];
        if (!sheetObj.MpaTableName || !sheetObj.SelectRow || sheetObj.SelectRowNumber == null) {
          continue; // 未映射表
        }
        const sheetEntity = new HiExcelTemplateSheetEntity();
        sheetEntity.SheetName = sheetName;
        sheetEntity.SourcesTableName = sheetObj.MpaTableName;
        sheetEntity.HeaderRowNumber = sheetObj.SelectRowNumber;
        sheetEntity.TemplateId = this.MainObj.TemplateId;
        const headRow = sheetObj.Rows[sheetEntity.HeaderRowNumber];
        for (let index = 0; index < headRow.Colums.length; index++) {
          const { CellValue: headerName, MapField: valueStr } = headRow.Colums[index];
          if (!valueStr) {
            throw `Sheet:[${sheetName}]的字段[${headerName}]还没有映射数据字段!`;
          }
          const sheetHeaderMap = new HiExcelHeaderMapEntity();
          sheetHeaderMap.FieldName = valueStr;
          sheetHeaderMap.HeadName = headerName;
          sheetHeaderMap.SheetName = sheetName;
          sheetHeaderMap.TemplateId = sheetEntity.TemplateId;
          sheetHeaderMapList.push(sheetHeaderMap);
        }
        sheetEntityList.push(sheetEntity);
      }
    }
    if (sheetEntityList.length < 1) {
      throw `请至少设置好一个Sheet的匹配关系!`;
    }
    const saveResult = await SaveExcelExport(
      this.MainObj,
      sheetEntityList,
      sheetHeaderMapList,
      isAdd,
    );
    return (saveResult.Data?.AddCount ?? 0) > 0;
  }
}
