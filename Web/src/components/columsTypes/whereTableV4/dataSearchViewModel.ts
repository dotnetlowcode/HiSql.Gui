import { List } from 'linqts';

import { Dictionary } from '@/helper/arrayHelper';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import {
  DataBaseDateType,
  DataBaseNumberType,
  DataBaseStringType,
} from '../fromEdit/fromEditViewModel';

export type WhereTableV4 = {
  getFilterWhere: () => { Sql: string; SqlParam: Dictionary<string, any> };
};

/**
 * 字段大类
 */
export type BigFieldType = 'Number' | 'String' | 'Date' | 'Other';

/**
 * 字段类型大类
 */
export const BigTypeArray: Array<{
  Title: string;
  TypeKey: BigFieldType;
}> = [
  {
    Title: '日期',
    TypeKey: 'Date',
  },
  {
    Title: '文本',
    TypeKey: 'String',
  },
  {
    Title: '数值',
    TypeKey: 'Number',
  },
  {
    Title: '其他',
    TypeKey: 'Other',
  },
];

type SqlKeyType = 'in' | 'not In' | 'like' | '=' | 'between';

type SqlOperate = {
  /**
   * 操作名
   */
  Title: string;

  /**
   * Sql操作关键字
   */
  SqlKey: SqlKeyType;

  /**
   * 操作值
   */
  SqlValue: string;

  /**
   * 字段匹配类型
   */
  Select: boolean;
};
type OperateType = SqlOperate[];
const getDateOperate: () => OperateType = () => [
  {
    Title: '范围',
    SqlKey: 'between',
    SqlValue: ``,
    Select: true,
  },
];

const getStringOperate: () => OperateType = () => [
  {
    Title: '搜索',
    SqlKey: 'like',
    SqlValue: ``,
    Select: false,
  },
  {
    Title: '等于',
    SqlKey: '=',
    SqlValue: ``,
    Select: false,
  },
  {
    Title: '包含',
    SqlKey: 'in',
    SqlValue: ``,
    Select: true,
  },
  {
    Title: '不包含',
    SqlKey: 'not In',
    SqlValue: ``,
    Select: false,
  },
];
const getNumberOperate: () => OperateType = () => [
  {
    Title: '等于',
    SqlKey: '=',
    SqlValue: ``,
    Select: false,
  },
  {
    Title: '区间',
    SqlKey: 'between',
    SqlValue: ``,
    Select: true,
  },
  {
    Title: '包含',
    SqlKey: 'in',
    SqlValue: ``,
    Select: false,
  },
  {
    Title: '不包含',
    SqlKey: 'not In',
    SqlValue: ``,
    Select: false,
  },
];

/**
 * 展示字段扩展类
 */
export type ShowColumnType = ColumnStruct & {
  /**
   * 字段单位
   */
  Unit: string;
  /**
   * 日期维度
   */
  Picker: string;
  /**
   * 日期显示秒
   */
  ShowTime: boolean;

  /**
   * 所属大类
   */
  FieldBigType: BigFieldType;

  /**
   * 所属大类描述
   */
  FieldBigTypeDesc: string;
  /**
   * 是否已选择为筛选字段
   */
  Select: boolean;

  /**
   * 操作类型
   */
  Operate: OperateType;

  /**
   * 当前操作类型索引
   */
  OperateIndex: number;

  fieldStruct: ColumnsRenderParam | undefined;
};

export class DataSearchViewModel {
  constructor(private tableColumnList: Array<ColumnStruct>) {}

  setColumns(tableColumnList: Array<ColumnStruct>) {
    this.tableColumnList.length = 0;
    this.tableColumnList.push(...tableColumnList);
    this.fieldParse();
  }

  /**
   * 渲染字段
   */
  showColumn: Array<ShowColumnType> = [];

  /**
   * 渲染字段(大类分组)
   */
  showGroupColumn: Dictionary<string, any> = {};

  /**
   * 已选中字段数据(界面显示)
   */
  selectedDataList: Array<ShowColumnType> = [];

  /**
   * 渲染字段分组
   */

  groupFieldColumn() {
    this.showGroupColumn = new List(this.showColumn).GroupBy(r => r.FieldBigTypeDesc);
  }

  /**
   * 根据大类值获取大类描述
   * @param value
   * @returns
   */
  getBigFieldTypeDesc(value: string) {
    if (!value) {
      return '';
    }
    const doubled = BigTypeArray.filter(r => r.TypeKey === value);
    return doubled.length > 0 ? doubled[0].Title : '';
  }

  /**
   * 更新渲染字段选中状态
   * @param child
   */
  updateShowColumn(child: {
    FieldName: string;
    Unit: string;
    Select: boolean;
    Operate: OperateType;
  }) {
    this.showColumn.forEach(ele => {
      if (ele.FieldName === child.FieldName && ele.Unit === child.Unit) {
        ele.Select = child.Select;
        ele.Operate = child.Operate;
      }
    });
  }

  // 生成选中的筛选界面数据
  createdSelectedDataList() {
    const list = this.showColumn.filter(r => {
      return r.Select;
    });
    this.selectedDataList.push(...list);
  }

  // 删除选中的筛选条件;
  deleteItem(item: ShowColumnType) {
    const result = this.selectedDataList.filter(r => {
      return !(r.FieldName === item.FieldName && r.Unit === item.Unit);
    });
    this.selectedDataList.length = 0;
    this.selectedDataList.push(...result);
    this.showColumn.forEach(ele => {
      if (ele.FieldName === item.FieldName) {
        ele.Select = false;
      }
    });
  }

  /**
   * 字段解析方法
   */
  fieldParse() {
    // 清空数组
    this.showColumn.length = 0;
    // 处理字段
    this.tableColumnList.forEach(fieldObj => {
      const { FieldType } = fieldObj;
      if (DataBaseDateType.includes(FieldType)) {
        [`月`, `周`, `日`, `秒`].forEach(fieldUnit => {
          let picker = '';
          let showTime = false;
          switch (fieldUnit) {
            case '月':
              picker = 'month';
              break;
            case '周':
              picker = 'week';
              break;
            case '日':
              picker = 'date';
              break;
            case '秒':
              picker = 'datetime';
              showTime = true;
              break;
            default:
              break;
          }
          this.showColumn.push({
            ...fieldObj,
            Unit: fieldUnit,
            FieldBigType: 'Date',
            FieldBigTypeDesc: this.getBigFieldTypeDesc('Date'),
            Select: false,
            Picker: picker,
            ShowTime: showTime,
            Operate: getDateOperate(),
            OperateIndex: 0,
            fieldStruct: undefined,
          });
        });
      } else if (DataBaseNumberType.includes(FieldType)) {
        this.showColumn.push({
          ...fieldObj,
          Unit: '',
          FieldBigType: 'Number',
          FieldBigTypeDesc: this.getBigFieldTypeDesc('Number'),
          Select: false,
          Operate: getNumberOperate(),
          Picker: '',
          ShowTime: false,
          OperateIndex: 0,
          fieldStruct: undefined,
        });
      } else if (DataBaseStringType.includes(FieldType)) {
        this.showColumn.push({
          ...fieldObj,
          Unit: '',
          FieldBigType: 'String',
          FieldBigTypeDesc: this.getBigFieldTypeDesc('String'),
          Select: false,
          Operate: getStringOperate(),
          Picker: '',
          ShowTime: false,
          OperateIndex: 0,
          fieldStruct: undefined,
          IsHTextCheck: true,
        });
      } else {
        this.showColumn.push({
          ...fieldObj,
          Unit: '',
          FieldBigType: 'Other',
          FieldBigTypeDesc: this.getBigFieldTypeDesc('Other'),
          Select: false,
          Operate: getStringOperate(),
          Picker: '',
          ShowTime: false,
          OperateIndex: 0,
          fieldStruct: undefined,
        });
      }
    });
    // 类型排序
    this.showColumn.sort((objA, objB) => {
      return objA.FieldBigType.localeCompare(objB.FieldBigType);
    });
    // 是否已选择为筛选字段
    this.showColumn.forEach(
      (ele: {
        Operate: OperateType;
        OperateIndex: number;
        fieldStruct: ColumnsRenderParam | undefined;
        FieldName: string;
      }) => {
        if (!!ele.Operate && ele.Operate.length > 0) {
          ele.OperateIndex = ele.Operate.findIndex(r => {
            return r.Select;
          });
        }
        const tempFrom: { [key: string]: any } = {};
        const fieldType = new List(this.showColumn).FirstOrDefault(
          r => r?.FieldName === ele.FieldName,
        );
        tempFrom[ele.FieldName] = '';
        ele.fieldStruct = new ColumnsRenderParam(tempFrom, fieldType, this.showColumn);
      },
    );
    // 大类分组
    this.groupFieldColumn();
  }

  /**
   * 生成结果Sql和参数
   * @returns
   */
  queryBuild() {
    let whereSql = ``;
    const whereParam: Dictionary<string, number | string | Array<string | number>> = {};
    for (let index = 0; index < this.showColumn.length; index++) {
      const fieldObj = this.showColumn[index];
      if (!fieldObj.Select) {
        // 没有选中的字段直接忽略
        continue;
      }
      const [firstOperate] = fieldObj.Operate.filter(r => r.Select);
      switch (firstOperate.SqlKey) {
        case '=':
          whereSql += `${fieldObj.FieldName}=@${fieldObj.FieldName} and `;
          whereParam[fieldObj.FieldName] = firstOperate.SqlValue;
          break;
        case 'between':
          // eslint-disable-next-line no-case-declarations
          const [beingValue, endValue] = firstOperate.SqlValue.split(`,`);
          if (beingValue) {
            whereSql += `${fieldObj.FieldName} >= @Begin${fieldObj.FieldName} and `;
            whereParam[`Begin${fieldObj.FieldName}`] = beingValue;
          }
          if (endValue) {
            whereSql += `${fieldObj.FieldName} <= @End${fieldObj.FieldName} and `;
            whereParam[`End${fieldObj.FieldName}`] = endValue;
          }
          break;
        case 'in':
          whereSql += `${fieldObj.FieldName} in (@${fieldObj.FieldName}) and `;
          whereParam[fieldObj.FieldName] = firstOperate.SqlValue.split(`,`);
          break;
        case 'like':
          whereSql += `${fieldObj.FieldName} like @${fieldObj.FieldName} and `;
          whereParam[fieldObj.FieldName] = `%${firstOperate.SqlValue}%`;
          break;
        case 'not In':
          whereSql += `${fieldObj.FieldName} not in (@${fieldObj.FieldName}) and `;
          whereParam[fieldObj.FieldName] = firstOperate.SqlValue.split(`,`);
          break;
        default:
          break;
      }
    }
    whereSql = whereSql.replace(/\sand\s$/gi, ``); // 去除结尾and
    return {
      whereSql,
      whereParam,
    };
  }
}
