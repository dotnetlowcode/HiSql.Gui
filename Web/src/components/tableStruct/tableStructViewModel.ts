import { List } from 'linqts';
import { Dictionary } from '@/helper/arrayHelper';

import { ColumnStruct, fieldSortFun } from '@/serverApi/models/columnStruct';

import { TableInfo } from '../../serverApi/apiModels/tableInfoModel';
import {
  getFieldMap,
  getTableInfo,
  saveTableInfo,
  tabModelTableName,
} from '../../serverApi/tableInfoAPIs';
import {
  DataBaseType,
  FromEditVueType,
  TableColumn,
} from '../columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '../columsTypes/searchFrom/searchFromViewModel';
import { tableDataUpdate } from '@/serverApi/tableDataAPIs';
import serverApiClient from '@/serverApi/httpClient';
import config from '@/serverApi/config';
import { ColumnsRenderParam } from '../columsTypes/columnsRender/columnsRenderViewModel';

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

  tabDescript = ``;

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

  showTableBaseInfoPanel = false;

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

  filedColumnFieldTypeMap: Dictionary<string, ColumnsRenderParam> = {};

  /**
   * 属性赋值
   * @param formRow
   * @param propName
   * @param value
   */
  setObjProp(formRow: Dictionary<string, any>, propName: string, value: any) {
    formRow[propName] = value;
  }

  /**
   * 获取表编辑结构
   * @param fromRow
   * @returns
   */
  getfieldTypeColumnStruct(fromRow: ColumnStruct) {
    if (!this.fieldTypeColumn) {
      return undefined;
    }
    const formRowStruct = this.filedColumnFieldTypeMap[fromRow.FieldName];
    if (formRowStruct) {
      return formRowStruct;
    }
    this.filedColumnFieldTypeMap[fromRow.FieldName] = new ColumnsRenderParam(
      fromRow,
      this.fieldTypeColumn,
      this.tableInfo.TabColumnStruct,
    );
  }

  fieldTypeColumn: ColumnStruct | undefined;

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
    if (this.tableInfo) {
      this.tableInfo.TabColumnStruct.sort(fieldSortFun);
      this.tableInfo.TabPropStruct.sort(fieldSortFun);
      this.tableName = tableInfoData.TabProps.TabName;
      this.tabDescript = tableInfoData.TabProps.TabDescript;
    }
    const [firstFieldTypeColumn] = this.tableInfo.TabColumnStruct.filter(
      r => r.FieldName === 'FieldType',
    );
    this.fieldTypeColumn = firstFieldTypeColumn;
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
    this.addNewColumns(Data?.TabColumns ?? []);
  }

  addNewColumns(columns: ColumnStruct[], isAppend = false) {
    const tempArray = [...columns];
    if (isAppend) {
      tempArray.push(...this.tableInfo.TabColumns);
    }
    const fieldMap: Dictionary<string, boolean> = {};
    tempArray.forEach(r => {
      fieldMap[r.FieldName] = true;
    });
    if (columns) {
      for (let index = 0; index < columns.length; index++) {
        const fieldItem = columns[index];
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
    Data.TabProps.TabName = ``;
    Data.TabProps.TabDescript = ``;
    Data.TabProps.TabReName = ``;
    return Data;
  }

  /**
   * excel上传并导入地址
   */
  get PostUrl() {
    return `${config.ApiConfig.ApiHost}/hidata/table/getExcelColumn`;
  }

  /**
   * 初始化上传头部
   * @returns
   */
  GetPostHeader(): Dictionary<string, string> {
    return {
      Authorization: serverApiClient.Token,
    };
  }

  /**
   * 保存数据
   * @param columnData
   */
  async saveTabProp() {
    // const param = new TableDataAddRequest('Hi_FieldModel', columnData);
    // await saveTableRowData(param);
    const saveResult = await tableDataUpdate(tabModelTableName, this.tableInfo.TabProps, {
      TabName: this.tableName,
    });
    return saveResult.StatusCode === 200;
  }

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
    const table = this.tableInfo?.TabProps;
    const colums = this.tableInfo?.TabColumns;
    if (this.isAddTableModel) {
      table.TabName = this.tableName;
      table.TabDescript = this.tabDescript;
      colums.forEach(r => {
        r.TabName = this.tableName;
      });
    }
    if (!table || !colums) {
      throw `缺少表信息!`;
    }
    const saveResult = await saveTableInfo(table, colums, this.IsView);
    await this.saveTabProp(); // 保存表属性
    return saveResult;
  }
}
