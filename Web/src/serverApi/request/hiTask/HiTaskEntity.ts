export class HiTaskEntity {
  /**
   * 任务标题
   */
  Title = ``;

  /**
   *任务Id[必填参数]
   */
  TaskId = '';

  /**
   *任务执行周期
   */
  Cron = '0 0 2 * * ? ';

  /**
   *任务类型
   */
  Type: `SQL` | `ExcelExport` = 'SQL';

  /**
   *SQL
   */
  SQL = '';

  /**
   * 引用的Excel模板
   */
  TemplateId = ``;

  /**
   * 任务完成后通知地址
   */
  EventUrl = ``;

  /**
   *APIUrl
   */
  APIUrl = '';

  /**
   * 任务状态
   */
  Status = '0';

  /**
   * CreateTime
   */
  CreateTime: Date | string = new Date();

  /**
   * UpdateTime
   */
  UpdateTime: Date | string = new Date();

  /**
   * 存储方式
   * NewCreate 新建表,ReCreate 清空后重新写入,MergeCreate 合并更新
   */
  StoreType: 'NewCreate' | 'ReCreate' | 'MergeCreate' = 'NewCreate';

  /**
   * 存储文件名或表名
   */
  StoreName = '';

  /**
   * 存储名,后缀 `yyyy_MM_dd_hh_mm`
   */
  SotreFormat: 'yyyy_MM_dd_hh_mm' | 'yyyy_MM_dd' | 'yyyy_MM_dd_hh' = 'yyyy_MM_dd';
}
