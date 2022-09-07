import { TableDataQueryRequest, TableDataQueryResponse } from './tableDataQueryRequest';

export class TableDataBatchQueryRequest {
  Querys: Array<TableDataQueryRequest> = [];
}

export class TableDataBatchQueryResponse {
  Tables: Array<TableDataQueryResponse> = [];
}
