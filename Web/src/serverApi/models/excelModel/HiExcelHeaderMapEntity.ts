import { StringHelper } from '@/helper/stringHelper';

export class HiExcelHeaderMapEntity {
  /**
   * MapId[必填参数]
   */
  MapId: string = StringHelper.genGuid();

  /**
   * TemplateId
   */
  TemplateId = ``;

  /**
   * SheetName
   */
  SheetName = '';

  /**
   * HeadName
   */
  HeadName = '';

  /**
   * FieldName
   */
  FieldName = '';

  /**
   * 列索引
   */
  SortNum = 0;
}
