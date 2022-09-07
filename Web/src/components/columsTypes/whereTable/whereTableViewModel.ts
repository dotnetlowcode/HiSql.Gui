import { List } from 'linqts';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import { TableColumn } from '../fromEdit/fromEditViewModel';

export type whereOperate = '>' | '>=' | '=' | '<' | '<=' | 'in';
export type whereJoin = 'or' | 'and';

export const whereOperateMap: {
  [key: string]: whereOperate;
} = {};
whereOperateMap[`小于`] = '<';
whereOperateMap[`小于等于`] = '<=';
whereOperateMap[`大于`] = '>';
whereOperateMap[`大于等于`] = '>=';
whereOperateMap[`等于`] = '=';
export const whereJoinMap: { [key: string]: whereJoin } = {};
whereJoinMap[`或者`] = `or`;
whereJoinMap[`且`] = `and`;

export type typeOfTableRow = {
  whereField: string;
  whereOperate: whereOperate;
  whereValue: string | boolean | number | Date;
  whereJoin: whereJoin;
  whereOperateDisable: boolean;
  fieldStruct: ColumnsRenderParam;
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
 * 将字符串解析成数据列表
 * @returns
 */
export const whereStrToObj = (whereStr: string, columnStructs: ColumnStruct[]) => {
  const whereData: typeOfTableData = [];
  whereStr.replace(
    /\s{0,1}([^\s]*?)([=><]{1,2})([^\s]*?)(\s((and)|(or))){0,1}((\s{1})|$)/gi,
    ($0, $1, $2, $3, $4) => {
      // console.info(`0${$0},1${$1},2${$2},3${$3},4${$4},5${$5}`);
      const fieldName = $1 ?? ``;
      const fieldType = new List(columnStructs).FirstOrDefault(r => r?.FieldName === fieldName);
      switch ($3) {
        case `true`:
          $3 = true;
          break;
        case `false`:
          $3 = false;
          break;
        default:
          break;
      }
      const tempFrom: { [key: string]: any } = {};
      tempFrom[fieldName] = $3;
      let row: typeOfTableRow = {
        whereField: fieldName,
        whereOperate: $2 ?? `=`,
        whereValue: $3 ?? ``,
        whereJoin: $4 ?? `and`,
        whereOperateDisable: false,
        fieldStruct: reactive(new ColumnsRenderParam(tempFrom, fieldType, columnStructs)),
      };
      row = restRecord(row);
      whereData.push(reactive(row));
      return ``;
    },
  );
  return whereData;
};
