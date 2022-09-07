export class ApiEntity {
  url = ``;

  body = ``;

  ContentType = `application/json`;
}

/**
 * 生成C#请求示例代码
 * @param api
 * @returns
 */
export const genCSharpCode = (api: ApiEntity) => {
  return `
var client = new RestClient("${api.url}");
client.Timeout = -1;
var request = new RestRequest(Method.POST);
request.AddHeader("Content-Type", "${api.ContentType}");
var body = Newtonsoft.Json.JsonConvert.SerializeObject(new ${api.body});
request.AddParameter("${api.ContentType}", body,  ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
Console.WriteLine(response.Content);
    `;
};

export const genCurlCode = (api: ApiEntity) => {
  return `
curl --location --request POST '${api.url}' \
--header 'Content-Type: ${api.ContentType}' \
--data-raw '${api.body}'
    `;
};
