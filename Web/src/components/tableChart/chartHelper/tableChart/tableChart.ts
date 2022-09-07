/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConfigProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { ChartType, DimensionField, IChart, RegisterIChart } from '../ichart';
import tableChartComponent from './tableChartComponent.vue';

export class TableChart extends IChart {
  async Resize(): Promise<void> {
    // 无需处理
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
    _option: {
      title: string;
      subTitle?: string | undefined;
    },
  ): Promise<void> {
    const domAny = this.ChartDom as any;
    const tableHeaders: Array<{
      FieldDesc: string;
      FieldName: string;
    }> = [];
    rows = this.TranslateObj(rows);
    const firstRow = rows[0];
    for (const key in firstRow) {
      tableHeaders.push({
        FieldName: key,
        FieldDesc: key,
      });
    }
    domAny.VueObj = createApp(
      h(
        ConfigProvider,
        {
          locale: zhCN,
        },
        h(tableChartComponent, {
          data: rows,
          headers: tableHeaders,
          bordered: true,
          size: 'small',
          scroll: `{ x: 'max-content', y: 'max-content' }`,
        }),
      ),
    );
    domAny.VueObj.mount(domAny);
  }
}

RegisterIChart('Table', param => {
  return new TableChart(param);
});

export const TableChartType: ChartType = {
  Title: `表格`,
  TypeName: `Table`,
  IconName: `icon-a-HiSqlGUIICON_biaoge`,
};
