import { TableApiViewModel } from '../../tableApiDoc/tabApiViewModel';
import { codeWapre, getTableJson, responseJsonWapre } from './apiMarkDownHelper';
import { ApiEntity, genCSharpCode, genCurlCode } from './code';

/**
 * 修改方法API
 * @param viewModel
 * @returns
 */
export const updateApiMarkDownBody = (viewModel: TableApiViewModel, url: string) => {
  const apiEntity = new ApiEntity();
  apiEntity.url = url;
  apiEntity.body = `
  {
    "UpdateSet":${getTableJson(viewModel.tabColumnStruct, {
      isFilter: false,
      hasFieldDesc: false,
      spaceLen: 5,
    })},
    "WhereJson":${getTableJson(viewModel.tabColumnStruct, {
      isFilter: true,
      hasFieldDesc: false,
      spaceLen: 5,
    })}
  }`;
  const cSharpRequestCode = genCSharpCode(apiEntity);
  const curlRequestCode = genCurlCode(apiEntity);
  const updateBody = `
  {
    //要更新的字段
    "UpdateSet":{
      //可以更新哪些字段看 UpdateSet详细
      "字段":"字段值"
    },
    //字段条件
    "WhereJson":{
      //可以用哪些字段过滤请看 WhereJson详细
      "筛选字段":"字段值"
    }
  }
  `;
  const resultDataJson = `
  {
    //修改的数据行数
    "ModifyCount":1
  }
  `;
  return `> 请求 Body

${codeWapre(updateBody, 'javascript')}

> UpdateSet [只提交需要更新的字段]
${codeWapre(getTableJson(viewModel.tabColumnStruct), 'javascript')}

> WhereJson [只提交需要过滤的条件]
${codeWapre(getTableJson(viewModel.tabColumnStruct, { isFilter: true }), 'javascript')}

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
