import { List } from 'linqts';

import { SearchFromVue } from '@/components/columsTypes/searchFrom/searchFromViewModel';
import { Dictionary } from '@/helper/arrayHelper';
import {
  deleteChartInfo,
  getChartInfo,
} from '@/serverApi/chartAPIs';
import { getFieldMap } from '@/serverApi/tableInfoAPIs';

import {
  DsmList,
  HiChartFieldEntityToDimensionField,
} from '../chartDesign/chartDesignViewModel';
import {
  ChartDataModel,
  GetIChart,
  IChart,
} from '../chartHelper/ichart';

export class ChartShowViewModel {
  charInfo: ChartDataModel = new ChartDataModel();

  filedMap: Dictionary<string, string> = {};

  /**
   * 图表扩展属性
   */
  chartProps: Dictionary<string, string> = {};

  async Init(chartId: string) {
    const { charObj, charFields } = await getChartInfo(chartId);
    const chartInfo = new ChartDataModel();
    chartInfo.ChartId = charObj.ChartId;
    chartInfo.ChartType = charObj.Type;
    chartInfo.TableName = charObj.TableName;
    chartInfo.Title = charObj.Title;
    Object.assign(this.chartProps, JSON.parse(charObj.ExtJson || `{}`));
    const fieldGroups = new List(charFields).GroupBy(r => r.Dimension);
    // 循环初始化维度组数据
    for (let index = 0; index < DsmList.length; index++) {
      const dsmItem = DsmList[index];
      const itemList = fieldGroups[dsmItem.Id] ?? [];
      const tempSelectArray = chartInfo[dsmItem.BindPropName];
      if (itemList.length > 0) {
        // 遍历数据库维度字段转换成ViewModel维度字段
        for (let index = 0; index < itemList.length; index++) {
          const dmsField = itemList[index]; // 维度里的字段
          const dsmFieldObj = HiChartFieldEntityToDimensionField(dmsField);
          tempSelectArray.push(dsmFieldObj);
        }
      } else {
        chartInfo[dsmItem.BindPropName] = [];
      }
    }
    this.charInfo = chartInfo;
    const { Data } = await getFieldMap(chartInfo.TableName, 'Chart');
    if (Data?.List) {
      Data.List.forEach(k => {
        this.filedMap[k.FieldKey] = k.FieldValue;
      });
    }
  }

  ChartObj?: IChart;

  /**
   * 执行当前图表
   */
  async Excute(
    chartDom: HTMLElement,
    searchParam: Dictionary<string, any>,
    fieldMap: Dictionary<string, string>,
  ) {
    const { ChartType, SelectDmsFields, SelectValueFields, TableName } = this.charInfo;
    this.ChartObj = GetIChart(ChartType, {
      fieldMap,
      chartDom,
      selectDmsFields: SelectDmsFields,
      selectValueFields: SelectValueFields,
      tableName: TableName,
    });
    Object.assign(this.ChartObj.PropValue, this.chartProps);
    await this.ChartObj?.Excute(TableName, searchParam);
  }

  async Delete() {
    return deleteChartInfo(this.charInfo.ChartId);
  }

  async Resize() {
    this.ChartObj?.Resize();
  }

  ShowSearchFrom = false;

  SearchFromObj?: SearchFromVue;
}

export type ChartShowVue = {
  reload: (searchParam?: Dictionary<string, any>) => void;
  resize: () => void;
};
