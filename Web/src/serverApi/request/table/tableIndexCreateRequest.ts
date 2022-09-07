import { DataBaseResponse } from '../../../serverApi/apiModels/apiResultModel';
import { RequextBase } from '../../../serverApi/apiModels/requestBase';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

export class TableIndexCreateResponse extends DataBaseResponse {}

export class TableIndexCreateRequest extends RequextBase<TableIndexCreateResponse> {
  /**
   * 要操作的表名
   */
  TableName = ``;

  /**
   * 索引名
   */
  IndexName = ``;

  /**
   * 索引列集合
   */
  Columns: Array<ColumnStruct> = [];
}
