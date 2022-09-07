export class TableViewCreateRequest {
  /**
   * 创建视图的HiSQL
   */
  Sql = ``;

  /**
   * 表名
   */
  TableName = ``;
}

export class TableViewCreateResponse {
  /**
   *  是否创建成功
   */
  IsOk = false;
}
