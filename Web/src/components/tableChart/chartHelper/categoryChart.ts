import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { Dictionary } from '@/helper/arrayHelper';
import { ChartType, DimensionField, IChart, RegisterIChart } from './ichart';

export class CategoryChart extends IChart {
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
        pNames.push(r[fieldObj.fieldName]);
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
    const seriesArray: Array<{
      type: 'bar';
    }> = [];
    for (let index = 0; index < calcFields.length; index++) {
      seriesArray.push({ type: 'bar' });
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

RegisterIChart('Category', param => {
  return new CategoryChart(param);
});

export const CategoryChartType: ChartType = {
  Title: `柱状图`,
  TypeName: `Category`,
  IconName: `icon-a-HiSqlGUIICON_zhuzhuangtu`,
};
