export class TabIndex {
  /**
   * 表名称
   */
  TabName = ``;

  /**
   * 索引名称
   */
  IndexName = ``;

  /**
   * 索引类型
   */
  IndexType = ``;
}

export class TableIndexsReqeust {}

export class TableIndexsResponse {
  /**
   * 索引集合
   */
  List: Array<TabIndex> = [];
}
