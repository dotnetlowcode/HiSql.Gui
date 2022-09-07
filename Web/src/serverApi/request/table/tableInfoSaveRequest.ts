import { DataBaseResponse } from '@/serverApi/apiModels/apiResultModel';
import { ColumnStruct } from '../../models/columnStruct';
import { HiTable } from '../../models/tableProps';

/**
 * 保存表格操作级别
 */
export enum TableSaveOperateLevel {
  /**
   * 表是进行检测是否会执行成功，但不真正执行
   */
  Check = 0,
  /**
   * 检测并执行
   */
  Execute = 1,
}

/**
 * 保存表结构信息
 */
export class TableInfoSaveRequest {
  /**
   * 表列集合
   */
  TabColumnStruct: Array<ColumnStruct>;

  /**
   * 表属性集合
   */
  TabProps: HiTable;

  /**
   * 保存动作操作级别
   */
  OPLevel: TableSaveOperateLevel = TableSaveOperateLevel.Check;

  /**
   * 是否是视图
   */
  IsView = false;

  /**
   * 构建表格保存请求
   * @param tabProps 表格属性
   * @param tabColumnStruct 表格列集合
   */
  constructor(tabProps: HiTable, tabColumnStruct: Array<ColumnStruct>) {
    this.TabProps = tabProps;
    this.TabColumnStruct = tabColumnStruct;
  }
}

/**
 * 保存结果
 */
export class TableInfoSaveResponse extends DataBaseResponse {}
