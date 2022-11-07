import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { ChartParam, ChartType, DimensionField, IChart, RegisterIChart } from './ichart';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';

type pipDataType = Array<{
  value: number;
  name: string;
}>;

/**
 * 饼图
 */
export class PieChart extends IChart {
  constructor(param: ChartParam) {
    super(param);
    ///
    const titleProps = new ColumnStruct();
    titleProps.FieldName = '标题';
    titleProps.FieldType = DataBaseType.nvarchar;
    titleProps.FieldLen = 20;
    this.SetRenderFields([titleProps]);
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

    let pipData: pipDataType = [];
    const maxTypeLength = 10;
    rows.slice(0, maxTypeLength).forEach(r => {
      const pNames: Array<string> = [];
      groupFields.forEach(fieldObj => {
        const gvalue = r[fieldObj.fieldName];
        // 翻译一下
        pNames.push(gvalue);
      });
      const pValue = r[calcFields[0].fieldName];
      pipData.push({
        name: pNames.join('_'),
        value: pValue,
      });
    });
    pipData = this.TranslateObj(pipData);
    const chartOption: EChartsOption = {
      title: {
        text: option.title,
        subtext: option.subTitle,
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '详细',
          type: 'pie',
          radius: '60%',
          data: pipData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Pie', param => {
  return new PieChart(param);
});

export const PipChartType: ChartType = {
  Title: `饼图`,
  TypeName: `Pie`,
  IconName: `icon-a-HiSqlGUIICON_bingtu`,
};
