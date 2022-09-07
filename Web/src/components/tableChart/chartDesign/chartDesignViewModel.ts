import { List } from 'linqts';

import {
  DataBaseType,
  IsNumberColumn,
} from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { typeFieldMapVue } from '@/components/tableFieldMap/tableFieldMapViewModel';
import {
  getChartInfo,
  saveChartInfo,
} from '@/serverApi/chartAPIs';
import {
  ChartTypeName,
  HiChartEntity,
} from '@/serverApi/models/chartModel/HiChartEntity';
import {
  DMSKey,
  HiChartFieldEntity,
} from '@/serverApi/models/chartModel/HiChartFieldEntity';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { TableGetColumnsRequest } from '@/serverApi/request/table/tableGetColums';
import {
  apiError,
  getTableColumns,
} from '@/serverApi/tableInfoAPIs';

import { CategoryChartType } from '../chartHelper/categoryChart';
import { DigitalChartType } from '../chartHelper/digitalChart/digitalChart';
import { FunnelChartType } from '../chartHelper/funnelChart';
import { GaugeChartType } from '../chartHelper/gaugeChart';
import {
  calcType,
  ChartType,
  DimensionField,
  GetIChart,
  IChart,
} from '../chartHelper/ichart';
import { LineChartType } from '../chartHelper/lineChart';
import { ParallelChartType } from '../chartHelper/parallelChart';
import { PipChartType } from '../chartHelper/pieChart';
import { RadarChartType } from '../chartHelper/radarChart';
import { ScatterChartType } from '../chartHelper/scatterChart';
import { TableChartType } from '../chartHelper/tableChart/tableChart';
import { TreeChartType } from '../chartHelper/treeChart';

export const ChartTypes: Array<ChartType> = [
  DigitalChartType,
  TableChartType,
  PipChartType,
  // {
  //   Title: `IndicatorCard`,
  //   IconName: `icon-a-HiSqlGUIICON_zhibiaoka`,
  // },
  CategoryChartType,
  LineChartType,
  GaugeChartType,
  FunnelChartType,
  RadarChartType,
  ScatterChartType,
  ParallelChartType,
  TreeChartType,
  // {
  //   Title: `完成率`,
  //   TypeName: `Gauge`,
  //   IconName: `icon-a-HiSqlGUIICON_wanchengshuai`,
  // },
  // {
  //   Title: `堆积柱状图`,
  //   IconName: `icon-a-HiSqlGUIICON_duijizhuzhuangtu`,
  // },
  // {
  //   Title: `百分比图`,
  //   IconName: `icon-a-HiSqlGUIICON_baifenbitu`,
  // },
  // {
  //   Title: `折线图`,
  //   IconName: `icon-a-HiSqlGUIICON_zhexiantu`,
  // },

  // {
  //   Title: `条形图`,
  //   IconName: `icon-a-HiSqlGUIICON_tiaoxingtu`,
  // },
  // {
  //   Title: `堆积条形图`,
  //   IconName: `icon-a-HiSqlGUIICON_duijitiaoxingtu`,
  // },
  // {
  //   Title: `树形矩阵`,
  //   IconName: `icon-a-HiSqlGUIICON_shuxingjuzhen`,
  // },
];

export const DsmList: Array<{
  Id: DMSKey;
  Title: string;
  BindPropName: `SelectDmsFields` | `SelectValueFields` | `SelectFilterFields`;
}> = [
  {
    Id: `X`,
    Title: `X维度`,
    BindPropName: `SelectDmsFields`,
  },
  {
    Id: `Y`,
    Title: `Y数值`,
    BindPropName: `SelectValueFields`,
  },
  // {
  //   Id: `F`,
  //   Title: `筛选条件`,
  //   BindPropName: `SelectFilterFields`,
  // },
];

/**
 * 计数函数
 */
const countFun: calcType = {
  Text: `Count(计数)`,
  Value: `count`,
};

// 统计方式集合
export const calcList: Array<calcType> = [
  countFun,
  {
    Text: `Sum(求和)`,
    Value: `sum`,
  },
  {
    Text: `Avg(平均值)`,
    Value: `avg`,
  },
  {
    Text: `Max(最大值)`,
    Value: `max`,
  },
  {
    Text: `Min(最小值)`,
    Value: `min`,
  },
];

/**
 * 列转换为维度列
 * @param column
 * @returns
 */
export const ColumnStructToDimensionField: (column: ColumnStruct) => DimensionField = (
  column: ColumnStruct,
) => {
  const isNumber = IsNumberColumn(column);
  return {
    FieldName: column.FieldName,
    FieldDesc: column.FieldDesc,
    IsNumber: isNumber,
    FieldType: column.FieldType,
    Calculation: isNumber ? calcList : [countFun],
    SelectCalc: `count`, // 默认为计数
  };
};

export const HiChartFieldEntityToDimensionField = (
  fieldObj: HiChartFieldEntity,
  {
    isNumber,
  }: {
    isNumber: boolean;
  } = {
    isNumber: false,
  },
): DimensionField => {
  return {
    FieldName: fieldObj.FieldName,
    FieldDesc: fieldObj.FieldDesc,
    IsNumber: isNumber,
    Calculation: isNumber ? calcList : [countFun],
    SelectCalc: fieldObj.CalcType, // 默认为计数
    FieldType: isNumber ? DataBaseType.int : DataBaseType.nvarchar,
  };
};

export class TableChartViewModel {
  constructor(
    dbId: string,
    options: {
      tableName?: string;
      chartId?: string;
    } = {},
  ) {
    this.MainChartObj.TableName = options.tableName ?? ``;
    this.MainChartObj.ChartId = options.chartId ?? ``;
    this.MainChartObj.DBId = dbId; // 设置所属Dashboard
  }

  ShowAddChart = true;

  MainChartObj = new HiChartEntity();

  private CharFields: Array<HiChartFieldEntity> = [];

  /**
   * 初始化表信息
   */
  async Init() {
    await this.LoadColumns();
    if (this.MainChartObj.ChartId) {
      this.LoadChartInfo(this.MainChartObj.ChartId);
    }
  }

  /**
   * 维度字段
   */
  DimensionFields: Array<ColumnStruct> = [];

  /**
   * 维度开始拖拽
   */
  DMSIsDrag = false;

  /**
   * 字段开始拖拽
   */
  FieldIsDrag = false;

  /**
   * 选择的维度数据
   */
  SelectDmsFields: Array<DimensionField> = [];

  /**
   * 选择的值字段
   */
  SelectValueFields: Array<DimensionField> = [];

  /**
   * 选中的可筛选字段
   */
  SelectFilterFields: Array<DimensionField> = [];

  /**
   * 移除选中项
   * @param selectFileds
   * @param removeObj
   */
  RemoSelectItem<T>(selectFileds: Array<T>, removeObj: T) {
    for (let index = 0; index < selectFileds.length; index++) {
      if (selectFileds[index] === removeObj) {
        selectFileds.splice(index, 1);
        break;
      }
    }
  }

  ChartObj?: IChart;

  async SelectType(chartType: ChartTypeName) {
    this.MainChartObj.Type = chartType;
    if (!this.ChartMainDom) {
      return;
    }
    this.ChartObj = GetIChart(this.MainChartObj.Type, {
      chartDom: this.ChartMainDom,
      selectDmsFields: this.SelectDmsFields,
      selectValueFields: this.SelectValueFields,
      fieldMap: {},
      tableName: this.MainChartObj.TableName,
    });
    const pValue = JSON.parse(this.MainChartObj.ExtJson);
    for (const key in pValue) {
      const keyValue = pValue[key];
      this.ChartObj.PropValue[key] = keyValue;
    }
  }

  async LoadColumns() {
    const req = new TableGetColumnsRequest();
    req.TableName = this.MainChartObj.TableName;
    const { Data: data } = await getTableColumns(req);
    if (!data) {
      throw apiError;
    }
    data.TabColumnStruct?.sort((a, b) => {
      return a.SortNum - b.SortNum;
    });
    this.DimensionFields = data.TabColumnStruct;
  }

  /**
   * 加载图表配置信息
   * @param chartId
   */
  async LoadChartInfo(chartId: string) {
    if (this.DimensionFields.length < 1) {
      // 如果还没有加载表列数据,就先加载列数据
      await this.LoadColumns();
    }
    const { charObj, charFields } = await getChartInfo(chartId);
    this.MainChartObj = charObj;
    this.CharFields = charFields;
    const fieldGroups = new List(charFields).GroupBy(r => r.Dimension);
    // 循环初始化维度组数据
    for (let index = 0; index < DsmList.length; index++) {
      const dsmItem = DsmList[index];
      const itemList = fieldGroups[dsmItem.Id];
      if (!itemList) {
        continue;
      }
      const tableFields = new List(this.DimensionFields);
      const tempSelectArray = this[dsmItem.BindPropName];
      if (itemList.length > 0) {
        // 遍历数据库维度字段转换成ViewModel维度字段
        for (let index = 0; index < itemList.length; index++) {
          const dmsField = itemList[index]; // 维度里的字段
          const dbField = tableFields.FirstOrDefault(p => p?.FieldName === dmsField.FieldName);
          if (!dbField) {
            // 可能是原来有这个字段,后面删除了
            continue;
          }
          const dsmFieldObj = ColumnStructToDimensionField(dbField);
          dsmFieldObj.SelectCalc = dmsField.CalcType;
          tempSelectArray.push(dsmFieldObj);
        }
      } else {
        this[dsmItem.BindPropName] = [];
      }
    }
    this.SelectType(this.MainChartObj.Type);
  }

  /**
   * 更新属性设置
   */
  UpdateChartSettingValue(k: string, v: any) {
    if (this.ChartObj) {
      this.ChartObj.PropValue[k] = v;
    }
  }

  async Save() {
    if (this.MainChartObj.Title.length < 1) {
      throw `请设置图表标题!`;
    }
    if (this.SelectDmsFields.length === 0 || this.SelectValueFields.length === 0) {
      throw `请设置好X维度和Y数值!`;
    }
    this.CharFields.length = 0;
    // 循环初始化维度组数据
    for (let index = 0; index < DsmList.length; index++) {
      const dsmItem = DsmList[index];
      const selectFields = this[dsmItem.BindPropName];
      selectFields.forEach(vField => {
        const dbField = new HiChartFieldEntity();
        dbField.CalcType = vField.SelectCalc;
        dbField.FieldName = vField.FieldName;
        dbField.FieldDesc = vField.FieldDesc;
        dbField.Dimension = dsmItem.Id;
        dbField.CreateTime = new Date();
        dbField.ModiTime = new Date();
        this.CharFields.push(dbField);
      });
    }
    await this.TableFieldMapInstance?.Save();
    return saveChartInfo(this.MainChartObj, this.CharFields, this.ChartObj?.PropValue ?? {});
  }

  /**
   * 自定义字段映射组件实例
   */
  TableFieldMapInstance?: typeFieldMapVue;

  DragAdd(p: any) {
    debugger;
    console.log(p);
  }

  ChartMainDom?: HTMLElement;

  /**
   * 执行当前图表
   */
  async Excute() {
    if (
      !this.ChartMainDom ||
      this.SelectDmsFields.length < 0 ||
      this.SelectValueFields.length < 0
    ) {
      return;
    }
    if (!this.ChartObj) {
      return;
    }
    const fieldMap = this.TableFieldMapInstance?.GetFieldMap() ?? {};
    debugger;
    this.ChartObj.FieldMap = fieldMap;
    await this.ChartObj?.Excute(this.MainChartObj.TableName, {});
  }
}
