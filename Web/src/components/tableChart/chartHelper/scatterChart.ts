import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { List } from 'linqts';

import {
  ChartParam,
  ChartType,
  IChart,
  RegisterIChart,
} from './ichart';

export class ScatterChart extends IChart {
  constructor(param: ChartParam) {
    super(param);
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    option: {
      title: string;
      subTitle?: string | undefined;
    },
  ): Promise<void> {
    const seriesData: Array<{
      name: string;
      data: Array<any>;
      type: string;
      // eslint-disable-next-line @typescript-eslint/ban-types
      symbolSize?: Function;
      // eslint-disable-next-line @typescript-eslint/ban-types
      emphasis?: Object;
      // eslint-disable-next-line @typescript-eslint/ban-types
      itemStyle?: Object;
    }> = [];

    const dimensionsArray: Array<string> = [];
    debugger;
    const groupRowsMap = new List(rows).GroupBy(r => r[groupFields[0].fieldName]);
    // const groupRowsMap1 = new List(rows).GroupBy(r => r[groupFields[1].fieldName]);
    for (const key in groupRowsMap) {
      if (Object.prototype.hasOwnProperty.call(groupRowsMap, key)) {
        if (dimensionsArray.length > 5) {
          break;
        }
        dimensionsArray.push(key);
        const valueArr: any[] = [];
        if (groupRowsMap[key].length > 0) {
          // eslint-disable-next-line no-loop-func
          groupRowsMap[key].forEach(item => {
            const valueArr2: any[] = [];
            for (const key2 in item) {
              if (Object.prototype.hasOwnProperty.call(item, key2)) {
                const element = item[key2];
                valueArr2.unshift(element);
              }
            }
            valueArr.push(valueArr2);
          });
        }
        // 排除重复添加
        if (
          seriesData.findIndex(r => {
            return r.name === key;
          }) === -1
        ) {
          seriesData.push({
            name: key,
            data: valueArr,
            type: 'scatter',
            symbolSize(data: number[]) {
              return Math.random() * 30;
            },
            emphasis: {
              focus: 'series',
              label: {
                show: true,
                formatter(param: { data: any[] }) {
                  return param.data[3];
                },
                position: 'top',
              },
            },
          });
        }
        // if (groupRowsMap[key].length > 0) {
        //   // eslint-disable-next-line no-loop-func
        //   indicator.forEach(() => {
        //     const valueArr: any[] = [];
        //     if (indicator.length >= groupRowsMap[key].length) {
        //       groupRowsMap[key].forEach(ele => {
        //         valueArr.push(ele[calcFields[0].fieldName]);
        //       });
        //     } else {
        //       groupRowsMap[key].forEach((ele, eleIndex: number) => {
        //         if (eleIndex <= indicator.length) {
        //           valueArr.push(ele[calcFields[0].fieldName]);
        //         }
        //       });
        //     }
        //     // 排除重复添加
        //     if (
        //       yArray.findIndex(r => {
        //         return r.name === key;
        //       }) === -1
        //     ) {
        //       yArray.push({
        //         name: key,
        //         value: valueArr,
        //       });
        //     }
        //   });
        // }
      }
    }
    debugger;
    const chartOption: EChartsOption = {
      backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [
        {
          offset: 0,
          color: '#f7f8fa',
        },
        {
          offset: 1,
          color: '#cdd0d5',
        },
      ]),
      // title: {
      //   text: 'Basic Radar Chart',
      // },
      legend: {
        data: dimensionsArray,
        right: '10%',
        top: '3%',
        // data: ['1990', '2015'],
      },
      grid: {
        left: '8%',
        top: '10%',
      },
      xAxis: {
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      yAxis: {
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        scale: true,
      },
      series: seriesData as any,
      // series: [
      //   {
      //     name: '',
      //     type: 'scatter',
      //     data: yArray as any,
      //   },
      // ],
    };

    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Scatter', param => {
  return new ScatterChart(param);
});

export const ScatterChartType: ChartType = {
  Title: `散点图`,
  TypeName: `Scatter`,
  IconName: `icon-a-HiSqlGUIICON_guanxitu`,
};
