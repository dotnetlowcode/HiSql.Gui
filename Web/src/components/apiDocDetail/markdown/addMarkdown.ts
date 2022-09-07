import { TableApiViewModel } from '../../tableApiDoc/tabApiViewModel';
import { codeWapre, getTableJson, responseJsonWapre } from './apiMarkDownHelper';
import { ApiEntity, genCSharpCode, genCurlCode } from './code';

/**
 * 新增方法API
 * @param viewModel
 * @returns
 */
export const addApiMarkDownBody = (viewModel: TableApiViewModel, url: string) => {
  const apiEntity = new ApiEntity();
  apiEntity.url = url;
  apiEntity.body = getTableJson(viewModel.tabColumnStruct, {
    isFilter: false,
    hasFieldDesc: false,
  });
  const requestBodyJson = getTableJson(viewModel.tabColumnStruct, {
    isFilter: false,
    hasFieldDesc: true,
  });
  const cSharpRequestCode = genCSharpCode(apiEntity);
  const curlRequestCode = genCurlCode(apiEntity);
  return `> 请求 Body

${codeWapre(requestBodyJson, 'javascript')}

<br/>

> 响应结果

${codeWapre(responseJsonWapre('{}'), 'javascript')}

<br/>

> Data
${codeWapre(getTableJson(viewModel.tabColumnStruct), 'javascript')}

<br/>

> C# 示例代码

${codeWapre(cSharpRequestCode, 'C#')}

<br/>

> curl 示例代码

${codeWapre(curlRequestCode, 'shell')}
`;
};
