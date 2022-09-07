import { DataBaseResponse } from '@/serverApi/apiModels/apiResultModel';

export class TableDataDeleteRequest {
  WhereJson: { [key: string]: any } = {};

  IsClearTable = false;
}
export class TableDataDeleteResponse extends DataBaseResponse {}
