import { Dictionary } from '@/helper/arrayHelper';
import { tableData } from '../../../serverApi/tableInfoAPIs';
import { TableDataQueryRequest } from '../../../serverApi/request/tableData/tableDataQueryRequest';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

const hDropDownDataCache: Dictionary<string, Array<any>> = {};

export class HDropDownViewModel {
  async loadData(columnStruct: ColumnStruct) {
    const param = new TableDataQueryRequest();
    param.TableName = columnStruct.RefTab;
    param.Fields = columnStruct.RefFields;
    param.HiSqlWhere = columnStruct.RefWhere;
    const key = `${param.TableName},${param.Fields},${param.HiSqlWhere}`;
    let cacheResult = hDropDownDataCache[key];
    if (cacheResult) {
      return cacheResult;
    }
    param.PageIndex = -1; // 获取所有数据
    const result = await tableData(param);
    cacheResult = result.Data?.List ?? [];
    hDropDownDataCache[key] = cacheResult;
    return cacheResult;
  }
}

/**
 * 下拉框项
 */
export class DropdownItem {
  Title = ``;

  Value = ``;

  Select = false;
}

/**
 * 下拉项集合
 */
export type DropdownOptions = Array<DropdownItem>;
