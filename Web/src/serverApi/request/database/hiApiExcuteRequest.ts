import { Dictionary } from '@/helper/arrayHelper';

export class HiApiExcuteRequest {
  ApiId = ``;

  ApiName = ``;

  Params: Dictionary<string, any> = {};
}

export class TableResult<T = any> {
  /**
   * 开启分页时会返回总条数
   */
  TotalCount = 0;

  /**
   * 数据集合
   */
  Table: Array<T> = [];
}

export class HiApiExcuteResponse {
  Tables: { [blockResultKey: string]: TableResult } = {};
}
