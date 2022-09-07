import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { ChartParam, ChartType, DimensionField, IChart, RegisterIChart } from './ichart';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';

const targetProps = ColumnStruct.GetColumnStruct({
  FieldName: '目标值',
  FieldType: DataBaseType.bigInt,
  IsRequire: true,
});
const titleProps = ColumnStruct.GetColumnStruct({
  FieldName: '标题',
  FieldType: DataBaseType.nvarchar,
  IsRequire: true,
  FieldLen: 20,
});
export class GaugeChart extends IChart {
  constructor(param: ChartParam) {
    super(param);
    ///

    this.SetRenderFields([titleProps, targetProps]);
    this.PropValue[targetProps.FieldName] = 100;
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
    // const dimensionsArray = ['X', ...calcFields];
    // const sourceArray: Array<any> = [];
    // const maxTypeLength = 10;
    // rows.slice(0, maxTypeLength).forEach(r => {
    //   const pNames: Array<string> = [];
    //   groupFields.forEach(fieldObj => {
    //     pNames.push(r[fieldObj]);
    //   });
    //   const newRowObj: Dictionary<string, string | number> = {
    //     X: pNames.join('_'),
    //   };
    //   for (let index = 0; index < calcFields.length; index++) {
    //     const calcFieldName = calcFields[index];
    //     newRowObj[calcFieldName] = r[calcFieldName];
    //   }
    //   sourceArray.push(newRowObj);
    // });
    // const seriesArray: Array<{
    //   type: 'bar';
    // }> = [];
    // for (let index = 0; index < calcFields.length; index++) {
    //   seriesArray.push({ type: 'bar' });
    // }
    const v = rows[0][calcFields[0].fieldName] * 1;
    const max = this.PropValue[targetProps.FieldName] * 1;
    const title = this.PropValue[titleProps.FieldName];
    const chartOption: EChartsOption = {
      // tooltip: {
      //   formatter: '{a} <br/>{b} : {c}%',
      // },
      series: [
        {
          name: 'Pressure',
          type: 'gauge',
          min: 0,
          max,
          progress: {
            show: true,
          },
          data: [
            {
              value: v,
              name: title,
            },
          ],
        },
      ],
    };
    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Gauge', param => {
  return new GaugeChart(param);
});

export const GaugeChartType: ChartType = {
  Title: `完成率`,
  TypeName: `Gauge`,
  IconName: `icon-a-HiSqlGUIICON_wanchengshuai`,
};
