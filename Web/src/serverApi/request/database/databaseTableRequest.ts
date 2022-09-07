export type TableInfo = {
  DbServer: string;
  HasTabStruct: boolean;
  Schema: string;
  TabDescript: string;
  TabName: string;
  TabReName: string;
  TableType: number;
};

/**
 * 0表，1视图
 */
export type TableType = 0 | 1;

export class GetTablesRequest {
  /**
   * 表类型，0表，1视图
   */
  Type: TableType = 0;
}

export class GetTablesResponse {
  List: Array<TableInfo> = [];
}
