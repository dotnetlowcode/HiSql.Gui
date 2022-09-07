import { HiTable } from '../models/tableProps';
import { ColumnStruct } from '../models/columnStruct';

export class TableInfo {
  TabPropStruct: Array<ColumnStruct> = [];

  TabColumnStruct: Array<ColumnStruct> = [];

  TabProps: HiTable = new HiTable();

  TabColumns: Array<ColumnStruct> = [];
}
