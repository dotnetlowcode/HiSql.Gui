/**
 * 操作类型
 */
export enum TableOperate {
  Add = 0,
  Delete = 1,
  Update = 2,
}

export class TranOperteItem<TAdd = any> {
  constructor(
    tableName: string,
    type: TableOperate,
    option: {
      WhereJson?: { [key: string]: any };
      AddDatas?: Array<TAdd>;
      UpdateSet?: { [key: string]: any };
    } = {},
  ) {
    this.Type = type;
    this.TableName = tableName;
    this.WhereJson = option.WhereJson ?? {};
    this.AddDatas = option.AddDatas ?? [];
    this.UpdateSet = option.UpdateSet ?? {};
  }

  /**
   * 操作的表
   */
  TableName = '';

  /**
   * `新增`数据集合
   */
  AddDatas: Array<TAdd>;

  /**
   * `更新`新数据
   */
  UpdateSet: { [key: string]: any };

  /**
   * 操作类型
   */
  Type: TableOperate = TableOperate.Add;

  /**
   * 筛选条件类似mongodb条件语法
   */
  WhereJson: { [key: string]: any };

  /**
   * hiSqlWhere,例如: `fieldA <> 'aa' and fieldB='xx'`
   */
  HiSqlWhere = ``;

  /**
   * hiSqlWhere条件参数
   */
  HiSqlWhereParam = {};
}

/**
 * 事物批量操作
 */
export class TableDataTransactionOperateRequest {
  /**
   * 批量操作
   */
  Operates: Array<TranOperteItem> = [];
}

/**
 * 事物批量操作响应
 */
export class TableDataTransactionOperateResponse {
  /**
   * 增加数据行数
   */
  AddCount = 0;

  /**
   * 修改数据行数
   */
  UpdateCount = 0;

  /**
   * 删除数据行数
   */
  DeleteCount = 0;
}
