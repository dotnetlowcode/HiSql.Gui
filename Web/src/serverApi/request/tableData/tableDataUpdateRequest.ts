import { DataBaseResponse } from '@/serverApi/apiModels/apiResultModel';

export class TableDataUpdateRequest {
  /**
   * 要更新的字段和值
   */
  UpdateSet: { [key: string]: any } = {};

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
  HiSqlWhereParam = {};
}

export class TableDataUpdateResponse extends DataBaseResponse {
  /**
   * 更新的数据行数
   */
  ModifyCount = 0;
}
