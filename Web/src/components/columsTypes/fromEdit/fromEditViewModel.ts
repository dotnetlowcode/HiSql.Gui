/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable max-classes-per-file */
// eslint-disable-next-line max-classes-per-file

import { List } from 'linqts';
import { TableDataQueryRequest } from '../../../serverApi/request/tableData/tableDataQueryRequest';
import { tableData } from '../../../serverApi/tableInfoAPIs';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

/**
 * 数据库类型
 */
export enum DataBaseType {
  int = 21,
  bigInt = 22,
  smallInt = 23,
  decimal = 24,
  nvarchar = 11,
  varchar = 12,
  nchar = 13,
  text = 15,
  char = 14,
  dateTime = 41,
  date = 42,
  bool = 31,
  guid = 61,
  binary = 51,
}

export type HRenderType =
  | 'hText'
  | 'hNumber'
  | 'hDate'
  | 'hBool'
  | 'hRefTable'
  | 'hEnum'
  | 'hFile'
  | 'whereTable'
  | 'hDropDown'
  | 'unknown';

export const hRenderMap: { [key: string]: HRenderType } = {};
hRenderMap[DataBaseType.int] = 'hNumber';
hRenderMap[DataBaseType.bigInt] = 'hNumber';
hRenderMap[DataBaseType.smallInt] = 'hNumber';
hRenderMap[DataBaseType.decimal] = 'hNumber';
hRenderMap[DataBaseType.nvarchar] = 'hText';
hRenderMap[DataBaseType.varchar] = 'hText';
hRenderMap[DataBaseType.nchar] = 'hText';
hRenderMap[DataBaseType.text] = 'hText';
hRenderMap[DataBaseType.char] = 'hText';
hRenderMap[DataBaseType.dateTime] = 'hDate';
hRenderMap[DataBaseType.date] = 'hDate';
hRenderMap[DataBaseType.bool] = 'hBool';
hRenderMap[DataBaseType.guid] = 'hText';
hRenderMap[DataBaseType.binary] = 'hFile';

const numberTypes = new List([
  DataBaseType.int,
  DataBaseType.bigInt,
  DataBaseType.smallInt,
  DataBaseType.decimal,
]);
/**
 * 是否为数值类型字段
 * @param column
 * @returns
 */
export const IsNumberColumn = (column: ColumnStruct) => {
  return numberTypes.Contains(column.FieldType);
};

export class TableColumn {
  RenderType: HRenderType = 'unknown';

  DataType: DataBaseType;

  constructor(columnStruct: ColumnStruct) {
    this.DataType = columnStruct.FieldType;
    this.RenderType = TableColumn.setRanderType(columnStruct);
  }

  /**
   * 设置渲染类型
   * @param columnStruct
   * @returns
   */
  static setRanderType(columnStruct: ColumnStruct): HRenderType {
    let renderType = hRenderMap[columnStruct.FieldType];
    if (columnStruct.IsEnum && columnStruct.IsRefTab) {
      renderType = 'hDropDown';
    } else if (columnStruct.IsRefTab) {
      renderType = 'hRefTable';
    }
    if (columnStruct.FieldName === 'EditShowWhere') {
      renderType = 'whereTable';
    }
    return renderType;
  }
}

const TRUE = `true`;
const FALSE = `false`;

/**
 * 是否显示列
 * @param columnStruct 列结构信息
 * @param columnObj 当前编辑对象
 * @returns 是否显示
 */
export const showColumn = (
  columnStruct: ColumnStruct,
  columnObj: any,
  activGroup: string,
  isAddTableModel = false,
) => {
  if (isAddTableModel && columnStruct.FieldName === 'TabName') {
    return false;
  }
  if ((columnStruct.FieldGroup || 'Default') !== activGroup) {
    return false;
  }
  // IsRefTab=true&www=xxxxx
  if (columnStruct.EditShowWhere) {
    let whereStr = columnStruct.EditShowWhere;
    whereStr = whereStr
      .replace(/\s{0,1}([^\s]*?)=([^\s]*?)((\s{1})|$)/gi, ($1, $2, $3) => {
        const value = columnObj[$2];
        const valueType = typeof value;
        if (valueType === 'boolean') {
          return value && ($3 ?? ``).toLowerCase() === TRUE ? ` ${TRUE} ` : ` ${FALSE} `;
        }
        if (valueType === 'string') {
          return value === $3 ? ` ${TRUE} ` : ` ${FALSE} `;
        }
        if (valueType === 'number' || valueType === 'bigint') {
          return value === $3 * 1 ? ` ${TRUE} ` : ` ${FALSE} `;
        }
        return ` ${FALSE} `;
      })
      .replace(/\s{1}and\s{1}/gi, ` && `)
      .replace(/\s{1}or\s{1}/gi, ` || `);
    // eslint-disable-next-line no-eval
    return eval(whereStr);
  }
  return true;
};

export type fieldGroup = {
  ElementValue: string;
  ElementDesc: string;
};
let fieldGroups: Array<fieldGroup> = [];

/**
 * 加载字段分组
 * @returns
 */
export const loadFieldGroups = async () => {
  if (fieldGroups.length > 0) {
    return fieldGroups;
  }
  const param = new TableDataQueryRequest();
  param.TableName = `Hi_DataElement`;
  param.Fields = `ElementValue,ElementDesc`;
  param.HiSqlWhere = `Domain='FieldGroup'`;
  param.PageIndex = -1; // 获取所有数据
  const result = await tableData(param);
  fieldGroups = result.Data?.List ?? [];
  return fieldGroups;
};

export type FromEditVueType = { Save: () => Promise<any> };
