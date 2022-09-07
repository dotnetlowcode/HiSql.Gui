import dayjs from 'dayjs';
import { QueryParamBase } from './tableDataQueryRequest';

/**
 * 创建一个导出任务
 */
export class CreateExportTaskRequest extends QueryParamBase {
  /**
   * 是否为空模板
   */
  IsNullTemplate = false;
}

/**
 * 导出任务结果
 */
export class CreateExportTaskResponse {
  /**
   * 任务Id
   */
  TaskId = ``;

  /**
   * 下载Url
   */
  DowloadUrl? = ``;
}

/**
 * 导出任务状态查询
 */
export class ExportTaskStatusCheckRequest {
  TaskIds: Array<string> = [];

  LastUpdateTime: Date | string = ``;
}

export class TaskInfo {
  TaskId = ``;

  /**
   * 任务结果 JsonString
   */
  Result = ``;

  /**
   * 任务信息
   */
  Message = ``;

  /**
   * 当前任务状态
   */
  Status = 0;

  UpdateTime: string = dayjs().toString();
}

/**
 * 任务状态查询
 */
export class ExportTaskStatusCheckResponse {
  List: Array<TaskInfo> = [];
}
