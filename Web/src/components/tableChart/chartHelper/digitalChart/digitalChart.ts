import { ConfigProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { Dictionary } from '@/helper/arrayHelper';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { ChartParam, ChartType, DimensionField, IChart, RegisterIChart } from '../ichart';
import digitalChartView from './digitalChartView.vue';

const titleProps = ColumnStruct.GetColumnStruct({
  FieldName: '标题',
  FieldType: DataBaseType.nvarchar,
  IsRequire: true,
  FieldLen: 20,
});
export class DigitalChart extends IChart {
  constructor(param: ChartParam) {
    super(param);
    this.SetRenderFields([titleProps]);
  }

  async Resize(): Promise<void> {}

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
    const domAny = this.ChartDom as any;
    const v = rows[0][calcFields[0].fieldName];
    domAny.VueObj = createApp(
      h(
        ConfigProvider,
        {
          locale: zhCN,
        },
        h(digitalChartView, {
          dTitle: this.PropValue[titleProps.FieldName],
          dValue: v,
        }),
      ),
    );
    domAny.VueObj.mount(domAny);
  }
}

RegisterIChart('Digital', (param: ChartParam) => {
  return new DigitalChart(param);
});

export const DigitalChartType: ChartType = {
  Title: `指标卡`,
  TypeName: `Digital`,
  IconName: `icon-a-HiSqlGUIICON_zhibiaoka`,
};
