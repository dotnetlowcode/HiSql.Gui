import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { List } from 'linqts';

import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '@/components/columsTypes/searchFrom/searchFromViewModel';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

// eslint-disable-next-line prettier/prettier
import {
  ChartParam,
  ChartType,
  IChart,
  RegisterIChart,
} from './ichart';

export const SelectTable: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'ID',
  FieldDesc: '主键ID',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.SingleDropDown,
  IsRefTab: true,
  RefTab: `Hi_FieldModel`,
  RefField: 'FieldName',
  RefFields: 'FieldName,FieldDesc',
  RefFieldDesc: '字段名,字段描述',
  RefWhere: "TabName='xxxxx'",
});
export const SelectTable2: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'Type',
  FieldDesc: '类别字段',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.SingleDropDown,
  IsRefTab: true,
  RefTab: `Hi_FieldModel`,
  RefField: 'FieldName',
  RefFields: 'FieldName,FieldDesc',
  RefFieldDesc: '字段名,字段描述',
  RefWhere: "TabName='xxxxx'",
});
export const SelectTable3: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'Name',
  FieldDesc: '描述字段',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.SingleDropDown,
  IsRefTab: true,
  RefTab: `Hi_FieldModel`,
  RefField: 'FieldName',
  RefFields: 'FieldName,FieldDesc',
  RefFieldDesc: '字段名,字段描述',
  RefWhere: "TabName='xxxxx'",
});
export const SelectTable4: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'Relevance',
  FieldDesc: '关联字段',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.SingleDropDown,
  IsRefTab: true,
  RefTab: `Hi_FieldModel`,
  RefField: 'FieldName',
  RefFields: 'FieldName,FieldDesc',
  RefFieldDesc: '字段名,字段描述',
  RefWhere: "TabName='xxxxx'",
});
// const targetProps = ColumnStruct.GetColumnStruct({
//   FieldName: '关系值',
//   FieldType: DataBaseType.bigInt,
//   IsRequire: true,
//   SearchUIModel: SearchUIModelType.SingleDropDown,
//   SrchMode: undefined,
// });
export class GraphChart extends IChart {
  constructor(param: ChartParam) {
    super(param);


    ///
    SelectTable.RefWhere = `TabName='${param.tableName}'`;
    SelectTable2.RefWhere = `TabName='${param.tableName}'`;
    SelectTable3.RefWhere = `TabName='${param.tableName}'`;
    SelectTable4.RefWhere = `TabName='${param.tableName}'`;
    this.SetRenderFields([SelectTable, SelectTable2, SelectTable3, SelectTable4]);

    // this.PropValue[targetProps.FieldName] = 100;
  }

  async Resize(): Promise<void> {
    echarts.getInstanceByDom(this.ChartDom)?.resize();
  }
  /**
   *
   * @param list  分组列表
   * @param key   主键id字段名
   * @param nameKey   描述字段名
   * @param valueKey  值字段名
   * @param parentIDKey 父级id字段名
   * @param parentID 父级id值
   * @returns
   */

  arrToTree(
    list: string | any[],
    key: string,
    nameKey: string,
    valueKey: string,
    parentIDKey: string,
    parentID = 0,
  ) {
    // eslint-disable-next-line no-var, func-names
    var child = function (key: string, pareID: number) {
      const childs = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i][parentIDKey] === pareID) {
          list[i].name = list[i][nameKey];
          list[i].value = list[i][valueKey];

          list[i].children = child(key, list[i][key]);
          childs.push(list[i]);
        }
      }
      return childs;
    };
    return child(key, parentID);
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


    if (groupFields.length < 4) {
      throw 'X维度需要4项';
      // message.warning(`X维度需要4项`);
      return;
    }
    if (
      !this.PropValue.ID ||
      !this.PropValue.Name ||
      !this.PropValue.Relevance ||
      !this.PropValue.Type
    ) {
      throw '需要配置图表属性';
      // message.warning(`需要配置图表属性`);
      return;
    }

    const groupRowsMap = new List(rows).GroupBy(r => r[this.PropValue.Type]);

    const categories: { name: string }[] = [];
    const links: any = [];
    const nodes: { category: number; id: number; name: string; symbolSize: number }[] = [];
    for (const key in groupRowsMap) {
      if (Object.prototype.hasOwnProperty.call(groupRowsMap, key)) {
        categories.push({ name: key });
      }
    }
    let obj = { source: 0, target: '' };
    let obj1 = { category: 0, id: 0, name: '', symbolSize: 0, value: '' };
    rows.forEach((item, index) => {
      obj1 = JSON.parse(JSON.stringify(obj1));

      let lst = [];
      if (item[this.PropValue.Relevance]) {
        lst = item[this.PropValue.Relevance].split(',');
        lst.forEach((ele: any) => {
          obj = JSON.parse(JSON.stringify(obj));
          obj.source = index;
          obj.target = ele;
          links.push(obj);
        });
      }
      obj1.name = item[this.PropValue.Name];
      obj1.symbolSize = lst.length * 5;
      obj1.id = item[this.PropValue.ID];

      categories.forEach((e, eIndex) => {
        // 需要模糊等于 ==
        // eslint-disable-next-line eqeqeq
        if (item[this.PropValue.Type] == e.name) {
          obj1.category = eIndex;
        }
      });
      if (calcFields.length > 0) {
        obj1.value = item[calcFields[0].fieldName];
      }

      nodes.push(obj1);
    });

    const chartOption: EChartsOption = {
      tooltip: {},
      legend: [
        {
          data: categories.map(function (a) {
            return a.name;
          }),
        },
      ],
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: '',
          type: 'graph',
          layout: 'circular',
          circular: {
            rotateLabel: true,
          },
          data: nodes as any,
          links: links as any,
          categories: categories as any,
          roam: true,
          label: {
            position: 'right',
            formatter: '{b}',
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3,
          },
        },
      ],
    };

    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Graph', param => {
  return new GraphChart(param);
});

export const GraphChartType: ChartType = {
  Title: `关系图`,
  TypeName: `Graph`,
  IconName: `icon-a-HiSqlGUIICON_guanxitu`,
};
