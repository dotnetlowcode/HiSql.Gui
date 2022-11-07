import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { List } from 'linqts';

import {
  ChartParam,
  ChartType,
  IChart,
  RegisterIChart,
} from './ichart';

export class ParallelChart extends IChart {
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
    const yArray: Array<any> = [];

    const parallelAxis: Array<{
      dim?: number;
      name: string;
      type?: string;
      data?: Array<string>;
    }> = [];

    if (groupFields.length < 2 || calcFields.length < 1) {
      throw 'X维度需要至少2项，且Y数值不能为空';
      // message.warning(`X维度需要至少2项，且Y数值不能为空`);
      return;
    }
    const xArray = [];
    const groupRowsMap = new List(rows).GroupBy(r => r[groupFields[0].fieldName]);

    const groupRowsMap1 = new List(rows).GroupBy(r => r[groupFields[1].fieldName]);
    for (const key in groupRowsMap) {
      if (Object.prototype.hasOwnProperty.call(groupRowsMap, key)) {
        xArray.push(key);
        const valueArr: Array<string> = [];
        groupRowsMap[key].forEach(item => {
          valueArr.push(item[calcFields[0].fieldName]);
        });
        valueArr.push(key);
        yArray.push(valueArr);
      }
    }
    for (const key in groupRowsMap1) {
      if (Object.prototype.hasOwnProperty.call(groupRowsMap1, key)) {
        parallelAxis.push({
          name: key,
        });
      }
    }
    parallelAxis.push({
      name: groupFields[0].fieldName,
      type: 'category',
      data: xArray,
    });
    parallelAxis.forEach((item, index) => {
      item.dim = index;
    });

    // for (const key in groupRowsMap) {
    //   if (Object.prototype.hasOwnProperty.call(groupRowsMap, key)) {
    //     if (dimensionsArray.length > 5) {
    //       break;
    //     }
    //     dimensionsArray.push(key);
    //     const valueArr: any[] = [];
    //     if (groupRowsMap[key].length > 0) {
    //       // eslint-disable-next-line no-loop-func
    //       groupRowsMap[key].forEach(item => {
    //         const valueArr2: any[] = [];
    //         for (const key2 in item) {
    //           if (Object.prototype.hasOwnProperty.call(item, key2)) {
    //             const element = item[key2];
    //             valueArr2.unshift(element);
    //           }
    //         }
    //         valueArr.push(valueArr2);
    //       });
    //     }
    //     // 排除重复添加
    //     if (
    //       seriesData.findIndex(r => {
    //         return r.name === key;
    //       }) === -1
    //     ) {
    //       seriesData.push({
    //         name: key,
    //         data: valueArr,
    //         type: 'scatter',
    //         symbolSize(data: number[]) {
    //           return Math.random() * 30;
    //         },
    //         emphasis: {
    //           focus: 'series',
    //           label: {
    //             show: true,
    //             formatter(param: { data: any[] }) {
    //               return param.data[3];
    //             },
    //             position: 'top',
    //           },
    //         },
    //       });
    //     }

    //     // }
    //   }
    // }

    const chartOption: EChartsOption = {
      parallelAxis: parallelAxis as any,
      // parallelAxis: [
      //   { dim: 0, name: 'Price' },
      //   { dim: 1, name: 'Net Weight' },
      //   { dim: 2, name: 'Amount' },
      //   {
      //     dim: 3,
      //     name: 'Score',
      //     type: 'category',
      //     data: ['Excellent', 'Good', 'OK', 'Bad'],
      //   },
      // ],
      series: {
        type: 'parallel',
        lineStyle: {
          width: 4,
        },
        data: yArray as any,
        //  data: [
        // [12.99, 100, 82, 'Good'],
        // [9.99, 80, 77, 'OK'],
        // [20, 120, 60, 'Excellent'],
        // ],
      },
    };

    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Parallel', param => {
  return new ParallelChart(param);
});

export const ParallelChartType: ChartType = {
  Title: `平行坐标系`,
  TypeName: `Parallel`,
  IconName: `icon-a-HiSqlGUIICON_pinghangzuobiaoxi`,
};
