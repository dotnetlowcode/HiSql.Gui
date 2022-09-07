import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '@/components/columsTypes/searchFrom/searchFromViewModel';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

import {
  ChartParam,
  ChartType,
  IChart,
  RegisterIChart,
} from './ichart';

export const SelectTable: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'ID',
  FieldDesc: '子级ID',
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
  FieldName: 'ParentID',
  FieldDesc: '父级ID',
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
  FieldDesc: '节点描述',
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
export class TreeChart extends IChart {
  constructor(param: ChartParam) {
    super(param);
    debugger;

    ///
    SelectTable.RefWhere = `TabName='${param.tableName}'`;
    SelectTable2.RefWhere = `TabName='${param.tableName}'`;
    SelectTable3.RefWhere = `TabName='${param.tableName}'`;
    this.SetRenderFields([SelectTable, SelectTable2, SelectTable3]);

    // this.PropValue[targetProps.FieldName] = 100;
  }

  async Resize(): Promise<void> {
    echarts.getInstanceByDom(this.ChartDom)?.resize();
  }

  // arrToTree(arr: any[], key: string, parentId = 0) {
  //   const newArr: any[] = [];
  //   arr.forEach(item => {
  //     if (item[key] === parentId) {
  //       newArr.push({
  //         ...item,
  //         children: this.arrToTree(arr, key, item.Id),
  //       });
  //     }
  //   });
  //   return newArr;
  // }
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
    debugger;
    const treeData = this.arrToTree(
      rows,
      this.PropValue.ID,
      this.PropValue.Name,
      calcFields[0].fieldName,
      this.PropValue.ParentID,
    );
    // this.SelectValueFields[0].FieldName
    debugger;
    const chartOption: EChartsOption = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: {
        type: 'tree',
        data: treeData as any,
        top: '1%',
        left: '7%',
        bottom: '1%',
        right: '20%',
        symbolSize: 7,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 9,
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
          },
        },
        emphasis: {
          focus: 'descendant',
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    };

    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Tree', param => {
  return new TreeChart(param);
});

export const TreeChartType: ChartType = {
  Title: `树图`,
  TypeName: `Tree`,
  IconName: `icon-a-HiSqlGUIICON_shutu`,
};
