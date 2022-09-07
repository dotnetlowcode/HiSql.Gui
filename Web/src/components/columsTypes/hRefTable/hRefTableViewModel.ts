import { List } from 'linqts';
import { TableRowSelection } from 'ant-design-vue/es/table/interface';
import { apiError, getTableColumns, tableData } from '../../../serverApi/tableInfoAPIs';
import { TableDataQueryRequest } from '../../../serverApi/request/tableData/tableDataQueryRequest';
import { ColumnStruct, fieldSortFun, valueSplitText } from '../../../serverApi/models/columnStruct';
import { TableGetColumnsRequest } from '../../../serverApi/request/table/tableGetColums';

export type HRefTableViewData = {
  showSearchFromEdit: boolean;
  tableData: Array<any>;
  searchColumns: Array<ColumnStruct>;
  columnValue: string;
  showDialogSelect: boolean;
  isLoad: boolean;
  tableColumnStruct: Array<{
    title: string;
    dataIndex: string;
    width: number;
  }>;
  showFilterButtom: boolean;
};

export class HRefTableViewModel {
  viewData: HRefTableViewData = reactive<HRefTableViewData>({
    showSearchFromEdit: false,
    tableData: [],
    searchColumns: [],
    columnValue: ``,
    showDialogSelect: false,
    isLoad: false,
    tableColumnStruct: [],
    showFilterButtom: false,
  });

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  tableName = ``;

  tabColumnStruct: List<ColumnStruct> = new List();

  orderByField = ``;

  /**
   * 加载表数据信息
   */
  async loadTableInfo() {
    if (this.tabColumnStruct.Count() > 0) {
      return false;
    }
    const req = new TableGetColumnsRequest();
    req.TableName = this.tableName;
    const { Data: data } = await getTableColumns(req);
    if (!data) {
      throw apiError;
    }
    data.TabColumnStruct?.sort(fieldSortFun);
    this.tabColumnStruct = new List(data.TabColumnStruct);
    this.orderByField = this.tabColumnStruct.First(r => r?.IsPrimary ?? false).FieldName;
    return true;
  }

  fieldDescs: Array<string> = [];

  fields: Array<string> = [];

  initColumn = async (columnStruct: ColumnStruct) => {
    this.fieldDescs = columnStruct.RefFieldDesc.split(valueSplitText); // 类型编码,类型名称
    this.fields = columnStruct.RefFields.split(valueSplitText);
    this.viewData.tableColumnStruct.length = 0;
    for (let index = 0; index < this.fields.length; index++) {
      const fieldName = this.fields[index];
      const fieldDesc = this.fieldDescs[index];
      this.viewData.tableColumnStruct.push({
        title: fieldDesc,
        dataIndex: fieldName,
        width: 150,
      });
    }
    if (await this.loadTableInfo()) {
      // 第一次加载才初始化可搜索列
      this.viewData.searchColumns.length = 0;
      this.viewData.searchColumns.push(...this.getSearchColumns());
      if (this.viewData.searchColumns.length > 0) {
        this.viewData.showFilterButtom = true;
      }
    }
  };

  loadListData = async (
    columnStruct: ColumnStruct,
    rowSelection: TableRowSelection,
    searchWhereJson: { [key: string]: any } = {},
  ) => {
    this.viewData.isLoad = true;
    const data = await this.loadDialogData(columnStruct, searchWhereJson);
    this.viewData.isLoad = false;
    this.viewData.tableData = data;
    if (data.length > 0) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // 选中默认值
        // eslint-disable-next-line eqeqeq
        if (element[columnStruct.RefField] == this.viewData.columnValue) {
          this.viewData.columnValue = element[columnStruct.RefField];
          rowSelection.selectedRowKeys = [this.viewData.columnValue];
          break;
        }
      }
    }
  };

  setColumnValue = (propValue: string | undefined) => {
    this.viewData.columnValue = propValue ?? ``;
    if (typeof this.viewData.columnValue === 'string') {
      this.viewData.columnValue = this.viewData.columnValue.trim();
    }
  };

  /**
   * 获取可以搜索的列表
   * @returns
   */
  getSearchColumns() {
    const searchItems = this.tabColumnStruct.Where(r => r?.IsSearch ?? false);
    return searchItems.ToArray();
  }

  async loadDialogData(columnStruct: ColumnStruct, searchWhereJson: { [key: string]: any } = {}) {
    const param = new TableDataQueryRequest();
    param.TableName = columnStruct.RefTab;
    param.Fields = columnStruct.RefFields;
    param.HiSqlWhere = columnStruct.RefWhere;
    param.WhereJson = searchWhereJson;
    param.PageIndex = -1; // 获取所有数据
    const result = await tableData(param);
    return result.Data?.List ?? [];
  }
}
