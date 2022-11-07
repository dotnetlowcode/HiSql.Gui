import { v4 as uuidv4 } from 'uuid';
import { getSnowflakeId } from '@/serverApi/databaseAPIs';

/**
 * 字符串辅助操作
 */
export class StringHelper {
  /**
   * 生成GUID
   * @returns
   */
  static genGuid() {
    return uuidv4();
  }

  static async genSnowflakeid() {
    return (await getSnowflakeId(1))[0];
  }

  static async genSnowflakeids(count = 1) {
    return getSnowflakeId(count);
  }
}
