import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';

export type calcName = `count` | `sum` | `avg` | `max` | `min`;
export type DMSKey = 'X' | 'Y' | 'F';
export class HiChartFieldEntity {
  /**
   * FieldId[必填参数]
   */
  FieldId = ``;

  /**
   * ChartId
   */
  ChartId = ``;

  /**
   * 字段名
   */
  FieldName = '';

  /**
   * 字段描述
   */
  FieldDesc = '';

  /**
   * CalcType
   */
  CalcType: calcName = 'count';

  /**
   * 数据维度
   */
  Dimension: DMSKey = 'X';

  /**
   * ModiName
   */
  ModiName = '';

  /**
   * SortNum
   */
  SortNum = 0;

  /**
   * ModiTime
   */
  ModiTime: Date | string = new Date();

  /**
   * CreateTime
   */
  CreateTime: Date | string = new Date();

  /**
   * 字段类型
   */
  FieldType: DataBaseType = DataBaseType.varchar;
}
