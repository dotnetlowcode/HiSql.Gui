import { List } from 'linqts';

import { ColumnStruct } from '../../../serverApi/models/columnStruct';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import {
  DataBaseType,
  TableColumn,
} from '../fromEdit/fromEditViewModel';

export type whereOperate = '>' | '>=' | '=' | '<' | '<=' | 'in' | 'like' | 'between' | 'not in';
export type whereJoin = 'or' | 'and';

export const whereOperateMap: {
  [key: string]: whereOperate;
} = {};
whereOperateMap[`小于`] = '<';
whereOperateMap[`小于等于`] = '<=';
whereOperateMap[`大于`] = '>';
whereOperateMap[`大于等于`] = '>=';
whereOperateMap[`等于`] = '=';
whereOperateMap[`模糊`] = 'like';
whereOperateMap[`区间`] = 'between';
whereOperateMap[`包含`] = 'in';
whereOperateMap[`不包含`] = 'not in';
export const whereJoinMap: { [key: string]: whereJoin } = {};
whereJoinMap[`或者`] = `or`;
whereJoinMap[`且`] = `and`;

export type typeOfTableRow = {
  whereFieldDesc: string;
  whereField: string;
  whereOperate: whereOperate;
  whereValue: string | boolean | number | Date;
  whereJoin: whereJoin;
  whereOperateDisable: boolean;
  fieldStruct: ColumnsRenderParam;
  isMultiValue: boolean;
  fieldType: DataBaseType;
  isRefTab: boolean;
  // fieldStruct: (fName: string) => ColumnStruct;
};
/**
 * 条件表数据类型
 */
export type typeOfTableData = Array<typeOfTableRow>;

/**
 * 设置数据比对值
 * @param row
 */
export const restRecord = (row: typeOfTableRow) => {
  const randerType = TableColumn.setRanderType(row.fieldStruct.columnStruct);
  switch (randerType) {
    case 'hNumber':
      row.whereOperateDisable = false;
      break;
    case 'hDate':
      row.whereOperateDisable = false;
      row.whereValue = new Date();
      break;
    default:
      row.whereOperateDisable = true;
      break;
  }
  if (row.whereOperateDisable) {
    row.whereOperate = `=`;
  } else {
    row.whereValue = `0`;
  }
  return row;
};

/**
 *  根据选择的字段生成查询条件
 * @param whereStr
 * @param columnStructs
 * @returns
 */
export const whereQueryCondition = (whereArr: Array<string>, columnStructs: ColumnStruct[]) => {
  const whereData: typeOfTableData = [];
  if (!columnStructs.length) {
    return [];
  }
  if (!whereArr) {
    return [];
  }
  for (const task of whereArr) {
    const itemJson = columnStructs.find(item => {
      return item.FieldName === task;
    });
    if (itemJson) {
      const tempFrom: { [key: string]: any } = {};
      const fieldType = new List(columnStructs).FirstOrDefault(
        r => r?.FieldName === itemJson.FieldName,
      );
      tempFrom[itemJson.FieldName] = '';
      const row: typeOfTableRow = {
        whereFieldDesc: itemJson.FieldDesc,
        whereField: itemJson.FieldName,
        whereOperate: `=`,
        whereValue: ``,
        whereJoin: `and`,
        whereOperateDisable: false,
        fieldStruct: reactive(new ColumnsRenderParam(tempFrom, fieldType, columnStructs)),
        isMultiValue: false,
        fieldType: itemJson.FieldType,
        isRefTab: itemJson.IsRefTab,
      };

      whereData.push(row);
    }
  }
  return whereData;
};
