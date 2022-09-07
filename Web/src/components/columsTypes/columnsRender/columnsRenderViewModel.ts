import { ColumnStruct } from '../../../serverApi/models/columnStruct';

/**
 * ColumnsRenderParam参数错误
 */
const error = `columnStruct和tableColumnsStruct都不能为空!`;
export class ColumnsRenderParam {
  formData: any;

  columnStruct: ColumnStruct;

  TableColumnsStruct: Array<ColumnStruct> = [];

  get Id() {
    return this.columnStruct.FieldName;
  }

  /**
   * 是否是多值模式
   */
  multiValue = false;

  constructor(
    formData: any,
    columnStruct: ColumnStruct,
    tableColumnsStruct: Array<ColumnStruct>,
    isMultiValue = false,
  ) {
    if (!columnStruct || !tableColumnsStruct) {
      // eslint-disable-next-line no-debugger
      throw error;
    }
    this.columnStruct = columnStruct;
    this.formData = formData;
    this.TableColumnsStruct = tableColumnsStruct;
    this.multiValue = isMultiValue;
  }
}
