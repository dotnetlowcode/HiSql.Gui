import { DataBaseResponse } from '../../../serverApi/apiModels/apiResultModel';
import { RequextBase } from '../../../serverApi/apiModels/requestBase';

export class TableIndexDeleteResponse extends DataBaseResponse {}

export class TableIndexDeleteRequest extends RequextBase<TableIndexDeleteResponse> {
  /**
   * 要操作的表名
   */
  TableName = ``;

  /**
   * 索引名
   */
  IndexName = ``;
}
