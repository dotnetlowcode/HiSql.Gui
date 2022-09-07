import { StringHelper } from '@/helper/stringHelper';

export class HiExcelExportTemplateEntity {
  /**
   * 导出任务标题
   */
  Title = ``;

  /**
   * TemplateId[必填参数]
   */
  TemplateId = StringHelper.genGuid();

  /**
   * FileUrl
   */
  FileUrl = '';

  /**
   * ModiName
   */
  ModiName = '';

  /**
   * SortNum
   */
  SortNum = 0;

  /**
   * ModiTime
   */
  ModiTime: Date | string = new Date();
}
