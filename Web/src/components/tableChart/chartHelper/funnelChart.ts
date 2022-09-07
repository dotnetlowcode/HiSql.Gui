import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

import {
  ChartParam,
  ChartType,
  IChart,
  RegisterIChart,
} from './ichart';

export class FunnelChart extends IChart {
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
    option: {
      title: string;
      subTitle?: string | undefined;
    },
  ): Promise<void> {
    const xNameArray: Array<string> = [];
    const yArray: Array<{
      name: string;
      value: number;
    }> = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const gName = row[groupFields[0].fieldName];
      xNameArray.push(gName);
      yArray.push({
        name: gName,
        value: row[calcFields[0].fieldName],
      });
      if (index > 4) {
        break;
      }
    }
    const chartOption: EChartsOption = {
      title: {
        text: option.title || '漏斗图',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c}%',
      },
      toolbox: {
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {},
        },
      },
      legend: {
        data: xNameArray,
      },
      series: [
        {
          name: 'Funnel',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 20,
            },
          },
          data: yArray,
        },
      ],
    };

    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Funnel', param => {
  return new FunnelChart(param);
});

export const FunnelChartType: ChartType = {
  Title: `漏斗图`,
  TypeName: `Funnel`,
  IconName: `icon-a-HiSqlGUIICON_loudoutu`,
};
