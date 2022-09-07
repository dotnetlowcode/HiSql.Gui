import { List } from 'linqts';
import { Dictionary } from '@/helper/arrayHelper';
import { DataBaseType } from '../components/columsTypes/fromEdit/fromEditViewModel';
import { ColumnStruct } from './models/columnStruct';

export const searchParamToWhereJson = (
  tabColumnStruct: Array<ColumnStruct>,
  searchParam: { [key: string]: any },
) => {
  const searchWhere: Dictionary<string, any> = {};
  const propNames = Object.keys(searchParam);
  for (let index = 0; index < propNames.length; index++) {
    const propName = propNames[index];
    const searchItemValue = searchParam[propName];
    if (searchItemValue === '') {
      delete searchWhere[propName];
    } else {
      const column = new List(tabColumnStruct).FirstOrDefault(r => r?.FieldName === propName);
      const betweenValues = `${searchItemValue}`.split(`,`);
      const len = betweenValues.length;
      if (
        (len === 2 && column.FieldType === DataBaseType.date) ||
        column.FieldType === DataBaseType.dateTime
      ) {
        searchWhere[propName] = betweenValues;
      } else {
        searchWhere[propName] = searchItemValue;
      }
    }
  }
  return searchParam;
};

/**
 * 获取可以搜索的列表
 * @returns
 */
export const getSearchColumns = (tabColumnStruct: Array<ColumnStruct>) => {
  return tabColumnStruct.filter(r => r?.IsSearch ?? false);
};
