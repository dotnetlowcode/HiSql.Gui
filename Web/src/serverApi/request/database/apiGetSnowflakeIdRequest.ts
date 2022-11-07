export class ApiGetSnowflakeIdRequest {
  constructor(count = 1) {
    this.Count = count;
  }

  /**
   * 获取雪花id个数
   */
  Count: number;
}

export class ApiGetSnowflakeIdResponse {
  /**
   * ❄️ 雪花Id
   */
  SnowflakeIds: Array<number> = [];
}
