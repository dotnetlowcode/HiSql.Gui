/**
 * Api主体表名
 */
export const hiApiTableName = `Hi_Api`;

/**
 * 执行块
 */
export const hiApiBlockTableName = `Hi_ApiBlock`;

/**
 * Api参数表名
 */
export const hiApiParamTableName = `Hi_ApiParam`;

export class HiApiEntity {
  /**
   *ApiId[必填参数]
   */
  ApiId = '';

  /**
   *Type
   */
  Type = '';

  /**
   *SortNum
   */
  SortNum = 0;

  /**
   *CreateTime
   */
  CreateTime: Date | string = new Date();

  /**
   *CreateName
   */
  CreateName = '';

  /**
   *ModiTime
   */
  ModiTime: Date | string = new Date();

  /**
   *ModiName
   */
  ModiName = '';

  /**
   *IsPublish
   */
  IsPublish = 0;

  /**
   *Name
   */
  Name = '';

  /**
   * Api组名
   */
  GroupName = ``;
}
