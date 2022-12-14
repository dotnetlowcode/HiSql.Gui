import { List } from 'linqts';

import { IsNumberColumn } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { typeFieldMapVue } from '@/components/tableFieldMap/tableFieldMapViewModel';
import { getChartInfo, saveChartInfo } from '@/serverApi/chartAPIs';
import { ChartTypeName, HiChartEntity } from '@/serverApi/models/chartModel/HiChartEntity';
import { DMSKey, HiChartFieldEntity } from '@/serverApi/models/chartModel/HiChartFieldEntity';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { TableGetColumnsRequest } from '@/serverApi/request/table/tableGetColums';
import { apiError, getTableColumns } from '@/serverApi/tableInfoAPIs';

import { CategoryChartType } from '../chartHelper/categoryChart';
import { DigitalChartType } from '../chartHelper/digitalChart/digitalChart';
import { FunnelChartType } from '../chartHelper/funnelChart';
import { GaugeChartType } from '../chartHelper/gaugeChart';
import { GraphChartType } from '../chartHelper/graphChart';
import { Dictionary } from '../../../helper/arrayHelper';
import { WhereTableV4 } from '@/components/columsTypes/whereTableV4/dataSearchViewModel';

// eslint-disable-next-line prettier/prettier
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
import { queryTableField } from '@/serverApi/tableDataAPIs';

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
  GraphChartType,
  // {
  //   Title: `?????????`,
  //   TypeName: `Gauge`,
  //   IconName: `icon-a-HiSqlGUIICON_wanchengshuai`,
  // },
  // {
  //   Title: `???????????????`,
  //   IconName: `icon-a-HiSqlGUIICON_duijizhuzhuangtu`,
  // },
  // {
  //   Title: `????????????`,
  //   IconName: `icon-a-HiSqlGUIICON_baifenbitu`,
  // },
  // {
  //   Title: `?????????`,
  //   IconName: `icon-a-HiSqlGUIICON_zhexiantu`,
  // },

  // {
  //   Title: `?????????`,
  //   IconName: `icon-a-HiSqlGUIICON_tiaoxingtu`,
  // },
  // {
  //   Title: `???????????????`,
  //   IconName: `icon-a-HiSqlGUIICON_duijitiaoxingtu`,
  // },
  // {
  //   Title: `????????????`,
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
    Title: `X??????`,
    BindPropName: `SelectDmsFields`,
  },
  {
    Id: `Y`,
    Title: `Y??????`,
    BindPropName: `SelectValueFields`,
  },
];

/**
 * ????????????
 */
const countFun: calcType = {
  Text: `Count(??????)`,
  Value: `count`,
};

// ??????????????????
export const calcList: Array<calcType> = [
  countFun,
  {
    Text: `Sum(??????)`,
    Value: `sum`,
  },
  {
    Text: `Avg(?????????)`,
    Value: `avg`,
  },
  {
    Text: `Max(?????????)`,
    Value: `max`,
  },
  {
    Text: `Min(?????????)`,
    Value: `min`,
  },
];

/**
 * ?????????????????????
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
    SelectCalc: `count`, // ???????????????
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
    SelectCalc: fieldObj.CalcType, // ???????????????
    FieldType: fieldObj.FieldType,
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
    this.MainChartObj.DBId = dbId; // ????????????Dashboard
  }

  ShowAddChart = true;

  MainChartObj = new HiChartEntity();

  private CharFields: Array<HiChartFieldEntity> = [];

  /**
   * ??????????????????
   */
  async Init() {
    await this.LoadColumns();
    if (this.MainChartObj.ChartId) {
      this.LoadChartInfo(this.MainChartObj.ChartId);
    }
  }

  /**
   * ????????????
   */
  DimensionFields: Array<ColumnStruct> = [];

  /**
   * ??????????????????
   */
  DMSIsDrag = false;

  /**
   * ??????????????????
   */
  FieldIsDrag = false;

  /**
   * ?????????????????????
   */
  SelectDmsFields: Array<DimensionField> = [];

  /**
   * ??????????????????
   */
  SelectValueFields: Array<DimensionField> = [];

  /**
   * ????????????????????????
   */
  SelectFilterFields: Array<DimensionField> = [];

  /**
   * ???????????????
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

  whereTableV4: WhereTableV4 | undefined;

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
    const pValue = JSON.parse(this.MainChartObj.ExtJson || '{}');
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
   * ????????????????????????
   * @param chartId
   */
  async LoadChartInfo(chartId: string) {
    if (this.DimensionFields.length < 1) {
      // ?????????????????????????????????,?????????????????????
      await this.LoadColumns();
    }
    const { charObj, charFields } = await getChartInfo(chartId);
    this.MainChartObj = charObj;
    this.CharFields = charFields;
    const fieldGroups = new List(charFields).GroupBy(r => r.Dimension);
    // ??????????????????????????????
    for (let index = 0; index < DsmList.length; index++) {
      const dsmItem = DsmList[index];
      const itemList = fieldGroups[dsmItem.Id];
      if (!itemList) {
        continue;
      }
      const tableFields = new List(this.DimensionFields);
      const tempSelectArray = this[dsmItem.BindPropName];
      if (itemList.length > 0) {
        // ????????????????????????????????????ViewModel????????????
        for (let index = 0; index < itemList.length; index++) {
          const dmsField = itemList[index]; // ??????????????????
          const dbField = tableFields.FirstOrDefault(p => p?.FieldName === dmsField.FieldName);
          if (!dbField) {
            // ??????????????????????????????,???????????????
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
   * ??????????????????
   */
  UpdateChartSettingValue(k: string, v: any) {
    if (this.ChartObj) {
      this.ChartObj.PropValue[k] = v;
    }
  }

  async Save() {
    if (this.MainChartObj.Title.length < 1) {
      throw `?????????????????????!`;
    }
    if (this.SelectDmsFields.length === 0 || this.SelectValueFields.length === 0) {
      throw `????????????X?????????Y??????!`;
    }
    this.CharFields.length = 0;
    // ??????????????????????????????
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
        dbField.FieldType = vField.FieldType;
        this.CharFields.push(dbField);
      });
    }
    await this.TableFieldMapInstance?.Save();
    return saveChartInfo(this.MainChartObj, this.CharFields, this.ChartObj?.PropValue ?? {});
  }

  /**
   * ?????????????????????????????????
   */
  TableFieldMapInstance?: typeFieldMapVue;

  DragAdd(p: any) {
    console.log(p);
  }

  ChartMainDom?: HTMLElement;

  /**
   * ??????????????????
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
    const filterWhere = this.whereTableV4?.getFilterWhere();
    const searchParam: Dictionary<string, any> = {};
    this.ChartObj.SqlWhere = filterWhere?.Sql ?? '';
    this.ChartObj.SqlWhereParam = filterWhere?.SqlParam ?? {};
    this.ChartObj.FieldMap = fieldMap;
    await this.ChartObj?.Excute(this.MainChartObj.TableName, searchParam);
  }
}
