import { Random } from 'mockjs';

export class HiApiBlockEntity {
  /**
   *ApiBodyId[必填参数]
   */
  ApiBodyId = Random.guid();

  /**
   * 输出块数据健
   */
  BlockName = `Default`;

  /**
   *ApiId
   */
  ApiId = '';

  /**
   *SortNum
   */
  SortNum = 0;

  /**
   * 执行代码
   */
  CodeString = ``;

  /**
   *Sql
   */
  Sql = '';

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
   *输出结果
   */
  OutResult = true;

  /**
   * 结果是否启用分页
   */
  IsPageList = false;

  /**
   * 测试结果
   */
  TestResult = ``;
}
