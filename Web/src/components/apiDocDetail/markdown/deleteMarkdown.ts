import { TableApiViewModel } from '../../tableApiDoc/tabApiViewModel';
import { codeWapre, getTableJson, responseJsonWapre } from './apiMarkDownHelper';
import { ApiEntity, genCSharpCode, genCurlCode } from './code';

/**
 * 删除方法API
 * @param viewModel
 * @returns
 */
export const deleteApiMarkDownBody = (viewModel: TableApiViewModel, url: string) => {
  const apiEntity = new ApiEntity();
  apiEntity.url = url;
  apiEntity.body = `
  {
    "WhereJson":${getTableJson(viewModel.tabColumnStruct, {
      isFilter: true,
      hasFieldDesc: false,
      spaceLen: 5,
    })}
  }`;
  const cSharpRequestCode = genCSharpCode(apiEntity);
  const curlRequestCode = genCurlCode(apiEntity);
  const deleteBody = `
  {
    //字段条件
    "WhereJson":{
      //可以用哪些字段过滤请看 WhereJson详细
      "筛选字段":"字段值"
    }
  }
  `;
  const resultDataJson = `
  {
    //删除的数据行数
    "DeleteCount":1
  }
  `;
  return `> 请求 Body

${codeWapre(deleteBody, 'javascript')}

> WhereJson [只提交需要过滤的条件]
${codeWapre(
  getTableJson(viewModel.tabColumnStruct, { isFilter: true, hasFieldDesc: true }),
  'javascript',
)}

***

> 响应结果

${codeWapre(responseJsonWapre('{}'), 'javascript')}

<br/>

> Data
${codeWapre(resultDataJson, 'javascript')}

<br/>

> C# 示例代码

${codeWapre(cSharpRequestCode, 'C#')}

<br/>

> curl 示例代码

${codeWapre(curlRequestCode, 'shell')}
`;
};
