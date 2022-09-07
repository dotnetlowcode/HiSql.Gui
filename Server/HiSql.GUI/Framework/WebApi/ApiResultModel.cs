using HiSql.GUI.Framework.WebApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.AspNetCore.Mvc
{


    public class ApiResultModel : ApiResultModel<object>
    {

        public static ApiResultExection ThrowApiExection(string error, int status = 500, int httpStatusCode = 200)
        {
            throw new ApiResultExection(error, status, httpStatusCode);
        }


        /// <summary>
        /// 失败返回
        /// </summary>
        /// <param name="message"></param>
        /// <param name="resultCode"></param>
        /// <returns></returns>
        public static ApiResultModel<DataT> Fail<DataT>(string message = null, int errorCode = -1)
        {

            return new ApiResultModel<DataT>
            {
                StatusCode = errorCode,
                ErrorMessage = message,
            };
        }

        /// <summary>
        /// 成功执行的消息内容
        /// </summary>
        /// <param name="message">消息内容</param>
        /// <returns></returns>
        public static ApiResultModel<DataT> Success<DataT>(DataT data)
        {
            return new ApiResultModel<DataT>
            {
                Data = data
            };
        }
    }

    public class ApiResultModel<T>
    {

        public ApiResultModel() { }


        public ApiResultModel(T data)
        {
            this.Data = data;
        }

        /// <summary>
        /// 执行状态
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// 错误编码
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// 业务数据 
        /// </summary>
        public T Data { get; set; }

        /// <summary>
        /// 是否成功
        /// </summary>
        public bool IsSuccess
        {
            get
            {
                return StatusCode == 0;
            }
        }


    }
}
