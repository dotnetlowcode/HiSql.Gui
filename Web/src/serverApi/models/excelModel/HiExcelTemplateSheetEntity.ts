import { StringHelper } from '@/helper/stringHelper';

export class HiExcelTemplateSheetEntity {
  /**
   * SheetName[必填参数]
   */
  SheetName = '';

  /**
   * TemplateId[必填参数]
   */
  TemplateId = StringHelper.genGuid();

  /**
   * SourcesTableName
   */
  SourcesTableName = '';

  /**
   * HeaderRowNumber
   */
  HeaderRowNumber = 0;

  /**
   * ModiTime
   */
  ModiTime: Date | string = new Date();

  /**
   * ModiName
   */
  ModiName = '';

  /**
   * SortNum
   */
  SortNum = 0;
}
