import { v4 as uuidv4 } from 'uuid';

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
}
