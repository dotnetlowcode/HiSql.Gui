import { HiApiParamEntity } from '@/serverApi/models/tableModel/hiApiFields';
import { HiApiEntity } from '@/serverApi/models/tableModel/hiApiModel';

export class ApiSaveRequest {
  /**
   * Api类型
   * Query查询类型,
   * Excute执行类型 注意:`该类型目前还不支持`
   */
  ApiType: 'Query' | 'Excute' = 'Query';

  /**
   * 入参
   */
  InFields: Array<HiApiParamEntity> = [];

  /**
   * 出参
   */
  ResultJson = ``;

  /**
   * Api主体
   */
  Entity: HiApiEntity = new HiApiEntity();
}
export class ApiSaveResponse {}
