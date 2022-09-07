import { ColumnStruct } from '../../../serverApi/models/columnStruct';

export class TableGetColumnsRequest {
  TableName = ``;
}

export class TableGetColumnsResponse {
  TabColumnStruct: Array<ColumnStruct> = [];
}
