import { DataBaseType } from '../../components/columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '../../components/columsTypes/searchFrom/searchFromViewModel';

/**
 * 多值分割字符串
 */
export const valueSplitText = `,`;
/**
 * 搜索数据结构
 * `10 单值查询`,
 * `20 范围查询`,
 * `30 多值查询`
 */
export type SearchModel = 10 | 20 | 30;

/**
 * 是否为多值
 * @param srchMode
 * @returns
 */
export const isMultiModel = (srchMode: SearchModel) => {
  return srchMode === 20 || srchMode === 30;
};

/**
 * 列结构(仅供参考,后续可能增加或缺少某些属性)
 */
export class ColumnStruct {
  static GetColumnStruct(option: {
    [K in keyof ColumnStruct]?: ColumnStruct[K];
  }) {
    return Object.assign(new ColumnStruct(), option);
  }

  TabName = ``;

  FieldName = ``;

  /**
   * 表字段重命名
   */
  ReFieldName = ``;

  FieldDesc = ``;

  IsIdentity = false;

  IsPrimary = false;

  IsBllKey = false;

  FieldType: DataBaseType = DataBaseType.varchar;

  SortNum = 1;

  Regex = ``;

  DBDefault = 0;

  DefaultValue = ``;

  FieldLen = 0;

  FieldDec = 0;

  SNO = ``;

  SNO_NUM = ``;

  ShowDataList = false;

  /**
   * 编辑页面是否显示
   */
  EditShowWhere = ``;

  /**
   * 字段组名
   */
  FieldGroup = ``;

  IsSys = false;

  IsNull = false;

  IsRequire = false;

  IsIgnore = false;

  IsObsolete = false;

  IsShow = false;

  IsSearch = false;

  /**
   * 搜索渲染模式
   */
  SearchUIModel: SearchUIModelType = SearchUIModelType.SingleInput;

  SrchMode: SearchModel = 10;

  /**
   * 是否为枚举值
   */
  IsEnum = false;

  /**
   * 是否为引用表
   */
  IsRefTab = false;

  RefTab = ``;

  RefField = ``;

  RefFields = ``;

  RefFieldDesc = ``;

  RefWhere = ``;

  CreateTime = ``;

  CreateName = ``;

  ModiTime = ``;

  ModiName = ``;

  /**
   * 日期精度
   */
  DateAccurate = ``;
}

export const fieldSortFun = (a: ColumnStruct, b: ColumnStruct) => {
  if (a.IsPrimary) {
    return -1;
  }
  if (b.IsPrimary) {
    return 1;
  }
  return a.SortNum - b.SortNum;
};
