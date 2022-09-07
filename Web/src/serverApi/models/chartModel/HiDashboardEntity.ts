export class HiChartDashboardEntity {
  /**
   * DBId[必填参数]
   */
  DBId = ``;

  /**
   * Title
   */
  Title = '';

  /**
   * 关联表
   */
  TableName = '';

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
