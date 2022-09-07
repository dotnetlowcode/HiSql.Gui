import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { ChartType, DimensionField, IChart, RegisterIChart } from './ichart';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { Dictionary } from '@/helper/arrayHelper';

export class LineChart extends IChart {
  async Resize(): Promise<void> {
    echarts.getInstanceByDom(this.ChartDom)?.resize();
  }

  async DrawChart(
    groupFields: Array<{
      fieldName: string;
      showText: string;
    }>,
    calcFields: Array<{
      fieldName: string;
      showText: string;
    }>,
    rows: any[],
    option: {
      title: string;
      subTitle?: string | undefined;
    },
  ): Promise<void> {
    let dimensionsArray = ['X', ...calcFields.map(r => r.showText)];
    let sourceArray: Array<any> = [];
    const maxTypeLength = 10;
    rows.slice(0, maxTypeLength).forEach(r => {
      const pNames: Array<string> = [];
      groupFields.forEach(fieldObj => {
        const tempV = r[fieldObj.fieldName];
        // 翻译一下
        pNames.push(tempV);
      });
      const newRowObj: Dictionary<string, string | number> = {
        X: pNames.join('_'),
      };
      for (let index = 0; index < calcFields.length; index++) {
        const calcFieldObj = calcFields[index];
        newRowObj[calcFieldObj.showText] = r[calcFieldObj.fieldName];
      }
      sourceArray.push(newRowObj);
    });
    const seriesArray: Array<any> = [];
    for (let index = 0; index < calcFields.length; index++) {
      seriesArray.push({
        type: 'line',
        smooth: true,
        areaStyle: {},
      });
    }

    sourceArray = this.TranslateObj(sourceArray);
    dimensionsArray = this.TranslateObj(dimensionsArray);
    const chartOption: EChartsOption = {
      legend: {},
      tooltip: {},
      dataset: {
        dimensions: dimensionsArray,
        source: sourceArray,
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {},
      series: seriesArray,
    };
    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Line', param => {
  return new LineChart(param);
});

export const LineChartType: ChartType = {
  Title: `折线图`,
  TypeName: `Line`,
  IconName: `icon-a-HiSqlGUIICON_zhexiantu`,
};
