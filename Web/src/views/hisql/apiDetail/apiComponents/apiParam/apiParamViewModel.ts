import { Dictionary } from '@/helper/arrayHelper';
import { List } from 'linqts';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { TableGetColumnsRequest } from '@/serverApi/request/table/tableGetColums';
import { hiApiParamTableName } from '@/serverApi/models/tableModel/hiApiModel';
import { getTableColumns } from '@/serverApi/tableInfoAPIs';

export const Paramfields = [
  `Title`,
  `Type`,
  `IsRequired`,
  `ValueFrom`,
  `DefaultValue`,
  `DemoValue`,
  `Description`,
];

/**
 * API参数结构信息
 */
export const ApiParamColumnsStuct: Array<ColumnStruct> = [];

export class ApiParamViewModel {
  constructor() {}

  loadIng = ref(false);

  async loading() {
    try {
      if (ApiParamColumnsStuct.length < 1) {
        const req = new TableGetColumnsRequest();
        req.TableName = hiApiParamTableName;
        const tempList = (await getTableColumns(req)).Data?.TabColumnStruct ?? [];
        ApiParamColumnsStuct.length = 0;
        ApiParamColumnsStuct.push(...tempList);
      }
      Paramfields.forEach(fName => {
        this.tableParamStruct[fName] = new List(ApiParamColumnsStuct).First(
          r => r?.FieldName === fName,
        );
      });
      console.log(this.tableParamStruct);
    } catch (error) {
      console.error(error);
    }
    this.loadIng.value = true;
  }

  tableParamStruct: Dictionary<string, ColumnStruct> = reactive({});
}
