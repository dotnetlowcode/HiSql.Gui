import * as echarts from 'echarts';
import escapeStringRegexp from 'escape-string-regexp';

import { ColumnsRenderParam } from '@/components/columsTypes/columnsRender/columnsRenderViewModel';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { Dictionary } from '@/helper/arrayHelper';
import { ApiTestExcute } from '@/serverApi/databaseAPIs';
import { ChartTypeName } from '@/serverApi/models/chartModel/HiChartEntity';
import { calcName } from '@/serverApi/models/chartModel/HiChartFieldEntity';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

export type calcType = {
  Text: string;
  Value: calcName;
};

export class DimensionField {
  FieldName = ``;

  FieldDesc = ``;

  FieldType: DataBaseType = DataBaseType.varchar;

  IsNumber = false;

  Calculation: calcType[] = [];

  SelectCalc: calcName = 'count';
}

export type ChartParam = {
  chartDom: HTMLElement;
  selectDmsFields: DimensionField[];
  selectValueFields: DimensionField[];
  fieldMap: Dictionary<string, string>;
  tableName: string;
};

export abstract class IChart {
  ChartDom: HTMLElement;

  SelectValueFields: DimensionField[];

  SelectDmsFields: DimensionField[];

  PropValue: Dictionary<string, any> = {};

  Property: Array<ColumnStruct> = [];

  PropertyRenderFields: Array<ColumnsRenderParam> = [];

  /**
   * 设置图表属性
   * @param fields
   */
  SetRenderFields(fields: Array<ColumnStruct>) {
    this.Property.push(...fields);
    this.PropertyRenderFields = this.Property.map(r => {
      this.PropValue[r.FieldName] = '';
      return new ColumnsRenderParam(this.PropValue, r, this.Property);
    });
  }

  constructor(param: ChartParam) {
    this.ChartDom = param.chartDom;
    this.SelectValueFields = param.selectValueFields;
    this.SelectDmsFields = param.selectDmsFields;
    this.FieldMap = param.fieldMap;
  }

  FieldMap: Dictionary<string, string> = {};

  abstract Resize(): Promise<void>;

  abstract DrawChart(
    groupFields: Array<{
      fieldName: string;
      showText: string;
    }>,
    calcFields: Array<{
      fieldName: string;
      showText: string;
    }>,
    rows: Array<any>,
    option: { title: string; subTitle?: string },
  ): Promise<void>;

  /**
   * 执行当前图表
   */
  async Excute(tableName: string, searchParam: Dictionary<string, any>) {
    // do something
    const groupByFields: Array<string> = [];
    const valueFields: Array<string> = [];
    this.SelectDmsFields.forEach(f => {
      groupByFields.push(f.FieldName);
      valueFields.push(f.FieldName);
    });
    const calcFields: Array<{
      fieldName: string;
      showText: string;
    }> = [];
    this.SelectValueFields.forEach(f => {
      const tempFieldName = `${f.FieldName}_${f.SelectCalc}`;
      calcFields.push({
        fieldName: tempFieldName,
        showText: tempFieldName, // 如果有映射值,就传映射值
      });
      valueFields.push(`${f.SelectCalc}(${f.FieldName}) as ${tempFieldName}`);
    });
    const sql = `select ${valueFields.join(
      `,`,
    )} from ${tableName} $Where$ group by ${groupByFields.join(`,`)}`;
    const result = await ApiTestExcute(sql, searchParam);
    const rows = result.Data?.List ?? [];
    // calcFields = this.ObjectTextReplace(calcFields);
    // groupByFields = this.ObjectTextReplace(groupByFields);
    this.disposeOldChart();
    await this.DrawChart(
      groupByFields.map(r => {
        return {
          fieldName: r,
          showText: r, // 如果有映射值,就传映射值
        };
      }),
      calcFields,
      rows,
      {
        title: ``,
        subTitle: ``,
      },
    );
  }

  /**
   * 替换对象字符串
   * @param obj
   * @returns
   */
  TranslateObj<T>(obj: T) {
    debugger;
    let jsonStr = JSON.stringify(obj);
    for (const key in this.FieldMap) {
      const mapValue = this.FieldMap[key];
      const regStr = escapeStringRegexp(key);
      jsonStr = jsonStr.replace(new RegExp(`"${regStr}\\s{0,}"`, 'gi'), `"${mapValue}"`);
    }
    return JSON.parse(jsonStr) as T;
  }

  disposeOldChart() {
    const domAny = this.ChartDom as any;
    if (domAny.VueObj) {
      domAny.VueObj.unmount();
      delete domAny.VueObj;
    }
    const myChart = echarts.getInstanceByDom(this.ChartDom);
    if (myChart) {
      myChart.dispose();
    }
  }
}

export type ChartType = {
  Title: string;
  IconName: string;
  TypeName: ChartTypeName;
};
const IChartFunMap: Dictionary<string, (param: ChartParam) => IChart> = {};

export const GetIChart = (chartTypeName: ChartTypeName, param: ChartParam) => {
  return IChartFunMap[chartTypeName](param);
};

/**
 * 注册报表图形
 * @param chartTypeName
 * @param initFun
 */
export const RegisterIChart = (
  chartTypeName: ChartTypeName,
  initFun: (param: ChartParam) => IChart,
) => {
  IChartFunMap[chartTypeName] = initFun;
};

export class ChartDataModel {
  ChartId = ``;

  Title = ``;

  TableName = ``;

  ChartType: ChartTypeName = 'Pie';

  SelectDmsFields: DimensionField[] = [];

  SelectValueFields: DimensionField[] = [];

  SelectFilterFields: DimensionField[] = [];
}
