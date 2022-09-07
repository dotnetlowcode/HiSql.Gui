import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { List } from 'linqts';

import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

import {
  ChartParam,
  ChartType,
  IChart,
  RegisterIChart,
} from './ichart';

// const points = [`A`, `B`, `C`, `D`, `E`, `F`, `G`];
const points: any[] = [];
export class RadarChart extends IChart {
  constructor(param: ChartParam) {
    super(param);
    // const columnList: Array<ColumnStruct> = [];
    // for (let index = 0; index < 6; index++) {
    //   const titleProps = ColumnStruct.GetColumnStruct({
    //     FieldName: `${points[index]}_Title`,
    //     FieldDesc: `${points[index]}点标题`,
    //     FieldType: DataBaseType.nvarchar,
    //     IsRequire: true,
    //     FieldLen: 20,
    //   });
    //   const targetProps = ColumnStruct.GetColumnStruct({
    //     FieldName: `${points[index]}_MaxValue`,
    //     FieldDesc: `${points[index]}最大值`,
    //     FieldType: DataBaseType.bigInt,
    //     IsRequire: true,
    //   });
    //   columnList.push(titleProps, targetProps);
    // }
    // this.SetRenderFields(columnList);
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
    const yArray: Array<{
      name: string;
      value: Array<any>;
    }> = [];
    let indicator: Array<{
      name: string;
      max: number;
    }> = [];
    const dimensionsArray: Array<string> = [];

    debugger;
    const groupRowsMap = new List(rows).GroupBy(r => r[groupFields[0].fieldName]);
    const groupRowsMap1 = new List(rows).GroupBy(r => r[groupFields[1].fieldName]);
    const columnList: Array<ColumnStruct> = [];
    let obj = {
      name: '',
      max: 0,
    };
    // this.PropValue = {};
    if (!this.PropValue || JSON.stringify(this.PropValue) === '{}') {
      this.PropertyRenderFields = [];
      this.Property = [];
      for (const key in groupRowsMap1) {
        if (Object.prototype.hasOwnProperty.call(groupRowsMap1, key)) {
          const titleProps = ColumnStruct.GetColumnStruct({
            FieldName: `${key}_Title`,
            FieldDesc: `标题`,
            FieldType: DataBaseType.nvarchar,
            IsRequire: true,
            FieldLen: 20,
          });
          const targetProps = ColumnStruct.GetColumnStruct({
            FieldName: `${key}_MaxValue`,
            FieldDesc: `最大值`,
            FieldType: DataBaseType.bigInt,
            IsRequire: true,
          });
          columnList.push(titleProps, targetProps);
        }
      }
      this.SetRenderFields(columnList);
    }
    // 给图标属性标题赋值
    for (const key in this.PropValue) {
      if (Object.prototype.hasOwnProperty.call(this.PropValue, key)) {
        for (const key1 in groupRowsMap1) {
          if (Object.prototype.hasOwnProperty.call(groupRowsMap1, key1)) {
            if (key.indexOf(key1) === 0 && key.indexOf('_Title') >= 0) {
              this.PropValue[key] = key1;
            }
          }
          if (Object.prototype.hasOwnProperty.call(groupRowsMap1, key1)) {
            if (key.indexOf(key1) === 0 && key.indexOf('_MaxValue') >= 0) {
              this.PropValue[key] = 50; // 默认初始给最大值
            }
          }
        }
      }
    }

    for (const key in this.PropValue) {
      obj = JSON.parse(JSON.stringify(obj));
      if (Object.prototype.hasOwnProperty.call(this.PropValue, key)) {
        if (key.indexOf('_Title') >= 0) {
          obj.name = this.PropValue[key];
          obj.max = 0;
          indicator.push(obj);
        }
      }
    }
    indicator.forEach(ele => {
      for (const key in this.PropValue) {
        if (Object.prototype.hasOwnProperty.call(this.PropValue, key)) {
          if (key.indexOf('_MaxValue') >= 0 && key.indexOf(ele.name) === 0) {
            ele.max = this.PropValue[key];
          }
        }
      }
    });

    for (const key in groupRowsMap) {
      if (Object.prototype.hasOwnProperty.call(groupRowsMap, key)) {
        if (dimensionsArray.length > 5) {
          break;
        }
        dimensionsArray.push(key);
        if (groupRowsMap[key].length > 0) {
          // eslint-disable-next-line no-loop-func
          indicator.forEach(() => {
            const valueArr: any[] = [];
            if (indicator.length >= groupRowsMap[key].length) {
              groupRowsMap[key].forEach(ele => {
                valueArr.push(ele[calcFields[0].fieldName]);
              });
            } else {
              groupRowsMap[key].forEach((ele, eleIndex: number) => {
                if (eleIndex <= indicator.length) {
                  valueArr.push(ele[calcFields[0].fieldName]);
                }
              });
            }
            // 排除重复添加
            if (
              yArray.findIndex(r => {
                return r.name === key;
              }) === -1
            ) {
              yArray.push({
                name: key,
                value: valueArr,
              });
            }
          });
        }
      }
    }
    // 映射转化
    indicator = this.TranslateObj(indicator);
    const chartOption: EChartsOption = {
      // title: {
      //   text: 'Basic Radar Chart',
      // },
      legend: {
        data: dimensionsArray,
      },

      radar: {
        // shape: 'circle',
        indicator: indicator as any,
        // indicator: [
        //   { name: 'Sales', max: 6500 },
        //   { name: 'Administration', max: 16000 },
        //   { name: 'Information Technology', max: 30000 },
        //   { name: 'Customer Support', max: 38000 },
        //   { name: 'Development', max: 52000 },
        //   { name: 'Marketing', max: 25000 },
        // ],
      },
      series: [
        {
          name: '',
          type: 'radar',
          data: yArray as any,
        },
      ],
    };

    echarts.init(this.ChartDom).setOption(chartOption);
  }
}

RegisterIChart('Radar', param => {
  return new RadarChart(param);
});

export const RadarChartType: ChartType = {
  Title: `雷达图`,
  TypeName: `Radar`,
  IconName: `icon-a-HiSqlGUIICON_leida`,
};
