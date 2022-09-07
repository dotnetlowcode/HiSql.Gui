using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper
{
    public class HttpClientHelper
    {
        /// <summary>
        /// 发送POST数据请求
        /// </summary>
        /// <param name="url"></param>
        /// <param name="bodyData"></param>
        /// <returns></returns>
        public static async Task<object> PostData(string url, object bodyData)
        {
            var request = new RestRequest(url, Method.Post);
            request.AddHeader("Content-Type", "application/json");
            var body = Newtonsoft.Json.JsonConvert.SerializeObject(bodyData);
            request.AddParameter("application/json", body, ParameterType.RequestBody);
            var client = new RestClient();
            var resp = await client.ExecuteAsync(request);
            return resp;
        }

    }
}
