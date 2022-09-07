export class ApiTestExcuteRequest {
  HiSql = ``;

  Params: { [key: string]: string } = {};

  PageSize = 20;

  PageIndex = 1;

  OrderByField = ``;
}
export class ApiTestExcuteResponse {
  /**
   * 查询到数据集合
   */
  public List: Array<any> = [];

  /**
   * 总条数[注意PageIndex=-1时这个字段忽略]
   */
  public TotalCount = 0;
}
