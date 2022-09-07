export class ExportTaskInfoModel {
  TaskId = ``;

  Status = 0;

  Result = ``;

  TalbeName = ``;

  Message = ``;

  UpdateTime: string | Date = new Date();
}

/**
 * 表数据导出任务事件名
 */
export const ExportTaskAddEvent = `addExportTask`;
