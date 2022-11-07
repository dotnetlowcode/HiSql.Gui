export type ChartTypeName =
  | 'Pie'
  | 'Table'
  | 'Category'
  | 'Gauge'
  | 'Line'
  | 'Digital'
  | 'Funnel'
  | 'Radar'
  | 'Scatter'
  | 'Parallel'
  | 'Tree'
  | 'Graph';

export class HiChartEntity {
  /**
   * ChartId[必填参数]
   */
  ChartId = ``;

  /**
   * Title
   */
  Title = '';

  /**
   * Dashboard Id
   */
  DBId = '';

  /**
   * TableName
   */
  TableName = '';

  /**
   * 位置信息
   */
  Position = ``;

  /**
   * 配置信息
   */
  ExtJson = ``;

  /**
   * 报表类型
   */
  Type: ChartTypeName = 'Pie';

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
}
