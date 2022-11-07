/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable max-classes-per-file */
// eslint-disable-next-line max-classes-per-file

import { List } from 'linqts';

import { Dictionary } from '@/helper/arrayHelper';

import { ColumnStruct, fieldSortFun } from '../../../serverApi/models/columnStruct';
import { TableDataQueryRequest } from '../../../serverApi/request/tableData/tableDataQueryRequest';
import { tableData } from '../../../serverApi/tableInfoAPIs';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';

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

/**
 * 字符串类
 */
export const DataBaseStringType = [
  DataBaseType.nvarchar,
  DataBaseType.varchar,
  DataBaseType.nchar,
  DataBaseType.text,
  DataBaseType.char,
  DataBaseType.guid,
];

/**
 * 数值类
 */
export const DataBaseNumberType = [
  DataBaseType.int,
  DataBaseType.bigInt,
  DataBaseType.smallInt,
  DataBaseType.decimal,
];

/**
 * 日期时间类
 */
export const DataBaseDateType = [DataBaseType.dateTime, DataBaseType.date];

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
  | 'unknown'
  | 'hTextCheck';

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
    if (columnStruct.IsHTextCheck === true) {
      renderType = 'hTextCheck';
    }
    return renderType;
  }
}

const TRUE = `true`;
const FALSE = `false`;

export type fieldGroup = {
  ElementValue: string;
  ElementDesc: string;
};
const fieldGroups: Dictionary<string, Array<fieldGroup>> = {};

/**
 * 加载字段分组
 * @returns
 */
export const loadFieldGroups = async (fieldGroupName: string) => {
  if (fieldGroups[fieldGroupName]) {
    return fieldGroups[fieldGroupName];
  }
  const param = new TableDataQueryRequest();
  param.TableName = `Hi_DataElement`;
  param.Fields = `ElementValue,ElementDesc`;
  param.HiSqlWhere = `Domain=@Domain`; // `Domain='FieldGroup'`;
  param.HiSqlWhereParam = {
    Domain: fieldGroupName,
  };
  param.PageIndex = -1; // 获取所有数据
  const result = await tableData(param);
  fieldGroups[fieldGroupName] = result.Data?.List ?? [];
  return fieldGroups[fieldGroupName];
};

export type FromEditVueType = { Save: () => Promise<any> };

export class FromEditViewModel {
  formData: Dictionary<string, any> = {};

  rules: { [key: string]: Array<any> } = {};

  formRef?: {
    validate: () => Promise<any>;
  };

  fieldGroups: Array<fieldGroup> = [];

  fromFields: Array<ColumnsRenderParam> = [];

  /**
   * 是否显示列
   * @param columnStruct 列结构信息
   * @param columnObj 当前编辑对象
   * @returns 是否显示
   */
  showColumn = (columnStruct: ColumnStruct, isAddTableModel = false) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if (isAddTableModel && columnStruct.FieldName === 'TabName') {
      return false;
    }

    if (self.activGroup && (columnStruct.FieldGroup || 'Default') !== self.activGroup) {
      return false;
    }
    // IsRefTab=true&www=xxxxx
    if (columnStruct.EditShowWhere) {
      let whereStr = columnStruct.EditShowWhere;
      whereStr = whereStr
        .replace(/\s{0,1}([^\s]*?)=([^\s]*?)((\s{1})|$)/gi, ($1, $2, $3) => {
          const value: any = self.formData[$2];
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

  async load(tabColums: Array<ColumnStruct>, fieldGroupName: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    tabColums.sort(fieldSortFun);
    // 初始化表单验证规则,目前只加了非空验证,后续可以增加其他规则
    for (let index = 0; index < tabColums.length; index++) {
      const fieldObj = tabColums[index];
      self.fromFields.push(new ColumnsRenderParam(self.formData, fieldObj, tabColums, false));
      const fieldRule = [];
      if (fieldObj.IsRequire && fieldObj.DBDefault !== 10) {
        // 字段为必填且默认值不为String.Empty (N'')
        fieldRule.push({
          required: true,
          message: `请输入${fieldObj.FieldDesc}`,
          trigger: 'blur',
        });
      }
      // 其他规则后续补充.....
      if (fieldRule.length > 0) {
        self.rules[fieldObj.FieldName] = fieldRule;
      }
    }
    if (fieldGroupName) {
      const tempList = await loadFieldGroups(fieldGroupName);
      this.fieldGroups.length = 0;
      this.fieldGroups.push(...tempList);
    }
  }

  /**
   * 当前激活的组
   */
  activGroup = '';

  updateValue(p: any) {
    // console.info(`参数`, p);
    this.formData[p.fieldName] = p.value;
    // console.info(formData);
  }
}
