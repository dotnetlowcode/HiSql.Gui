export class TableDataAddRequest<T = any> {
  /**
   * 要查询的表名
   */
  TableName = ``;

  /**
   * 数据对象
   */
  Datas: Array<{ [key: string]: T }> = [];

  constructor(tableName: string, data: Array<{ [key: string]: T }>) {
    this.TableName = tableName;
    this.Datas = data;
  }
}

export class TableDataAddResponse {
  /**
   * 新增条数
   */
  AddCount = 0;
}
