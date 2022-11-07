import { Dictionary } from '@/helper/arrayHelper';

export class QueryParamBase {
  /**
   * 要查询的表名
   */
  TableName = ``;

  /**
   * `fieldA,fieldB,fieldC`
   */
  Fields = `*`;

  /**
   * 页索引
   */
  PageIndex = -1;

  /**
   * 页大小
   */
  PageSize = 30;

  /**
   * 排序
   */
  OrderByField = '';

  /**
   * 筛选条件类似mongodb条件语法
   */
  WhereJson: { [key: string]: any } = {};

  /**
   * hiSqlWhere,例如: `fieldA <> 'aa' and fieldB='xx'`
   */
  HiSqlWhere = ``;

  /**
   * hiSqlWhere条件参数
   */
  HiSqlWhereParam: Dictionary<string, any> = {};

  /**
   * 是否去重
   */
  Distinct: boolean = false;
}

export class TableDataQueryRequest extends QueryParamBase {}

export class TableDataQueryResponse<T = any> {
  TotalCount = 0;

  List: Array<T> = [];
}
