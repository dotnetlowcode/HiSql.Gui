// Single=>单选框,单选下拉
// Range =>日期范围,整型范围
// Multi =>多选框,多选下拉

import { ColumnStruct, isMultiModel } from '../../../serverApi/models/columnStruct';

// 10	单值输入
// 19	整型范围选择
// 20	日期范围选择
// 27	多值贴值[一行一个]
// 28	多值引用表
// 29	多值多选框
// 30	多值下拉框
// 8	单值单选框
// 9	单值下拉框

// eslint-disable-next-line no-shadow
export enum SearchUIModelType {
  SingleInput = 10,
  SingleRadio = 8,
  SingleDropDown = 9,
  DateBetween = 20,
  NumberBetween = 19,
  MultiPast = 27,
  MultiRefTable = 28,
  MultiCheckBox = 29,
  MultiDropDown = 30,
}
const setSearchBetweenField = (
  searchParamModel: { [key: string]: any },
  field: ColumnStruct,
  newSearchColumns: ColumnStruct[],
) => {
  const newBeginColumn = { ...field };
  const newEndColumn = { ...field };
  newBeginColumn.FieldName = `${field.FieldName}Begin`;
  newBeginColumn.FieldDesc = `[起始]${field.FieldDesc}`;
  newEndColumn.FieldName = `${field.FieldName}End`;
  newEndColumn.FieldDesc = `[结束]${field.FieldDesc}`;
  searchParamModel[newBeginColumn.FieldName] = ``;
  searchParamModel[newEndColumn.FieldName] = ``;
  newSearchColumns.push(newBeginColumn, newEndColumn);
};

/**
 * 设置多值字段
 * @param searchParamModel
 * @param field
 * @param newSearchColumns
 */
const setSearchMultiField = (
  searchParamModel: { [key: string]: any },
  field: ColumnStruct,
  newSearchColumns: ColumnStruct[],
) => {
  const newMulitColumn = { ...field };
  newSearchColumns.push(newMulitColumn);
  searchParamModel[field.FieldName] = ``;
};

/**
 * 设置单值字段
 * @param searchParamModel
 * @param field
 * @param newSearchColumns
 */
const setSearchSingleField = (
  searchParamModel: { [key: string]: any },
  field: ColumnStruct,
  newSearchColumns: ColumnStruct[],
) => {
  const newSingleColumn = { ...field };
  newSearchColumns.push(newSingleColumn);
  searchParamModel[field.FieldName] = ``;
};

/**
 * 解析搜索字段并生成新下字段列表
 * @param searchColumns
 * @returns
 */
export const getSearchParamModel = (searchColumns: ColumnStruct[]) => {
  const searchParamModel: { [key: string]: any } = {};
  const newSearchColumns: Array<ColumnStruct> = [];
  searchColumns.forEach(field => {
    // 如果SrchMode设置了单值,就忽略SearchUIModel
    if (!isMultiModel(field.SrchMode)) {
      setSearchSingleField(searchParamModel, field, newSearchColumns);
      return;
    }
    switch (field.SearchUIModel * 1) {
      case SearchUIModelType.DateBetween:
      case SearchUIModelType.NumberBetween:
      case SearchUIModelType.MultiCheckBox:
      case SearchUIModelType.MultiDropDown:
        setSearchMultiField(searchParamModel, field, newSearchColumns);
        break;
      default:
        setSearchSingleField(searchParamModel, field, newSearchColumns);
        break;
    }
  });
  return {
    searchParamModel,
    newSearchColumns,
  };
};

export type SearchFromVue = {
  Submit: () => {
    whereSql: string;
    whereParam: never[];
  };
};
