import { Random } from 'mockjs';

/**
 * `0=>String`
 * `1=>Number`
 * `2=>Date`
 * `3=>Boolean`
 */
// export type ParamFieldType = '0' | '1' | '2' | '3';

export enum ParamFieldType {
  String = 0,
  Number = 1,
  Date = 2,
  Boolean = 3,
}

export class HiApiParamEntity {
  /**
   * 仅客户端有
   */
  FackId: string = Random.guid();

  /**
   *Title[必填参数]
   */
  Title = '';

  /**
   *ApiId[必填参数]
   */
  ApiId = '';

  /**
   *ApiBodyId
   */
  ApiBodyId = '';

  /**
   * 参数类型
   */
  Type: ParamFieldType = ParamFieldType.String;

  /**
   *Description
   */
  Description = '';

  /**
   *IsRequired
   */
  IsRequired = false;

  /**
   * 是否为集合参数
   */
  IsArray = false;

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
   *是入参还是出参
   */
  FieldType: 'In' | 'Out' = 'In';

  /**
   *DemoValue
   */
  DemoValue = '';

  /**
   * 是否是主参数
   */
  IsMainParam = false;

  /**
   * 值绑定来源
   */
  ValueFrom = ``;

  /**
   * 默认值
   */
  DefaultValue = ``;
}
