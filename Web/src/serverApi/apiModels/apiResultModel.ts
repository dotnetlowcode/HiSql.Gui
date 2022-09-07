export default class ApiResultModel<T> {
  /**
   * 状态码
   */
  StatusCode = 0;

  /**
   * 错误信息
   */
  ErrorMessage = ``;

  /**
   * 数据实体
   */
  Data?: T;

  /**
   * 失败返回
   * @param message 错误消息
   * @param errorCode 错误码
   */
  static Fail(message: string, errorCode = -1) {
    const result = new ApiResultModel<any>();
    result.ErrorMessage = message;
    result.StatusCode = errorCode;
    return result;
  }

  /**
   * 成功执行的消息内容
   * @param data 返回的数据
   */
  // eslint-disable-next-line no-shadow
  static Success<T>(data: T) {
    const result = new ApiResultModel<T>();
    result.Data = data;
    return result;
  }
}

/**
 * 数据库执行结果
 */
export class DataBaseResponse {
  /**
   * 是否已执行
   */
  IsOk = false;

  /**
   * 准备执行的SQL
   */
  Sql = ``;

  /**
   * 执行反馈消息
   */
  Message = ``;
}
