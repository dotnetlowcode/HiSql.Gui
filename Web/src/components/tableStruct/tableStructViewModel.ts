import { List } from 'linqts';
import { Dictionary } from '@/helper/arrayHelper';

import { ColumnStruct, fieldSortFun } from '@/serverApi/models/columnStruct';

import { TableInfo } from '../../serverApi/apiModels/tableInfoModel';
import { getFieldMap, getTableInfo, saveTableInfo } from '../../serverApi/tableInfoAPIs';
import { DataBaseType, FromEditVueType } from '../columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '../columsTypes/searchFrom/searchFromViewModel';

export const SelectTable: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'SourcesTable',
  FieldDesc: '数据表表',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.SingleInput,

  IsRefTab: true,
  RefTab: `Hi_TabModel`,
  RefField: 'TabName',
  RefFields: 'TabName,TabReName,TabDescript',
  RefFieldDesc: '表名,别名,描述',
  RefWhere: '',
});

/**
 * 默认表格字段
 */
const defaultFields = new List([`CreateTime`, `CreateName`, `ModiTime`, `ModiName`]);
export const dataTypes: Array<{
  text: string;
  value: string;
}> = [];
for (const key in DataBaseType) {
  const typeObj: any = DataBaseType[key];
  if (typeof typeObj === 'number') {
    break;
  }
  dataTypes.push({
    text: typeObj,
    value: DataBaseType[typeObj],
  });
}

export default class TableDetailViewModel {
  tableName = ``;

  tableInfo: TableInfo = new TableInfo();

  tableFields: Array<ColumnStruct> = [];

  isLoading = true;

  isSaveing = false;

  /**
   * 是否为新增表模式
   */
  isAddTableModel = false;

  /**
   * 是否增加默认字段
   */
  addDefaultField = true;

  FromEditObj?: FromEditVueType;

  IsView = false;

  constructor(tableName: string, isView: boolean) {
    this.IsView = isView;
    if (tableName === ``) {
      this.isAddTableModel = true;
    } else {
      this.tableName = tableName;
    }
  }

  refreshData(tabColumns?: ColumnStruct[]) {
    if (!tabColumns) {
      tabColumns = this.tableInfo?.TabColumns ?? [];
    }
    this.tableFields.length = 0;

    // defaultFields
    if (this.addDefaultField) {
      this.tableFields.push(...tabColumns);
    } else {
      const fieldList = tabColumns.filter(r => !defaultFields.Contains(r.FieldName));
      this.tableFields.push(...fieldList);
    }
    this.tableHasChange = true;
    this.tableFields.sort(fieldSortFun);
  }

  /**
   * 加载表数据信息
   */
  async load() {
    let tableInfoData: TableInfo;
    if (this.isAddTableModel) {
      tableInfoData = await this.initNewTableInfo();
    } else {
      tableInfoData = await this.initRemoteTableInfo();
    }
    this.tableInfo = tableInfoData;
    this.tableInfo?.TabColumnStruct?.sort(fieldSortFun);
    this.tableInfo?.TabColumns?.sort(fieldSortFun);
    this.refreshData();
  }

  fieldKeyMap: Dictionary<string, string> = {};

  async loadFieldMap() {
    const { Data: fieldMapData } = await getFieldMap(
      this.tableName,
      this.IsView ? 'TableView' : 'Table',
    );
    if (fieldMapData) {
      fieldMapData.List.forEach(r => {
        this.fieldKeyMap[r.FieldKey] = r.FieldValue;
      });
    }
  }

  async copyTableColumn(tableName: string) {
    const { Data } = await getTableInfo(tableName);
    const tempArray = [...this.tableInfo.TabColumns];
    const fieldMap: Dictionary<string, boolean> = {};
    tempArray.forEach(r => {
      fieldMap[r.FieldName] = true;
    });
    if (Data?.TabColumns) {
      for (let index = 0; index < Data.TabColumns.length; index++) {
        const fieldItem = Data.TabColumns[index];
        if (fieldMap[fieldItem.FieldName]) {
          continue;
        }
        fieldItem.TabName = this.tableName;
        fieldMap[fieldItem.FieldName] = true;
        tempArray.push(fieldItem);
      }
    }
    this.tableInfo.TabColumns = tempArray;
    this.refreshData();
  }

  /**
   * 加载服务端表信息
   */
  private async initRemoteTableInfo() {
    const { Data } = await getTableInfo(this.tableName);
    if (!Data) {
      throw `加载失败!`;
    }
    return Data;
  }

  /**
   * 初始化新表基本信息
   */
  private async initNewTableInfo() {
    // NewTable
    // return getNewTableInfo(``) as any;
    const { Data } = await getTableInfo(`NewTable`);
    if (!Data) {
      throw `加载失败!`;
    }
    return Data;
  }

  // /**
  //  * 保存数据
  //  * @param columnData
  //  */
  // async saveRowData(columnData: any) {
  //   const param = new TableDataAddRequest('Hi_FieldModel', columnData);
  //   await saveTableRowData(param);
  // }

  tableHasChange = false;

  deleteColumn(column: ColumnStruct) {
    const sourcesList = this.tableInfo?.TabColumns ?? [];
    for (let index = 0; index < sourcesList.length; index++) {
      const element = sourcesList[index];
      if (element.FieldName === column.FieldName) {
        sourcesList.splice(index, 1);
        break;
      }
    }
    this.refreshData();
    this.tableHasChange = true;
  }

  /**
   * 执行表格变更请求
   */
  async saveTable() {
    debugger;
    const table = this.tableInfo?.TabProps;
    const colums = this.tableInfo?.TabColumns;
    if (this.isAddTableModel) {
      table.TabName = this.tableName;
      colums.forEach(r => {
        r.TabName = this.tableName;
      });
    }
    if (!table || !colums) {
      throw `缺少表信息!`;
    }
    const saveResult = await saveTableInfo(table, colums, this.IsView);
    return saveResult;
  }
}
