import { TableApiViewModel } from '../../tableApiDoc/tabApiViewModel';
import { codeWapre, getTableJson, responseJsonWapre } from './apiMarkDownHelper';
import { ApiEntity, genCSharpCode, genCurlCode } from './code';

/**
 * 查询方法API
 * @param viewModel
 * @returns
 */
export const queryApiMarkDownBody = (viewModel: TableApiViewModel, url: string) => {
  const orderFields = viewModel.getOrderFields();
  let orderFieldName = ``;
  if (orderFields.length > 0) {
    // eslint-disable-next-line prefer-destructuring
    orderFieldName = orderFields[0];
  }
  const apiEntity = new ApiEntity();
  apiEntity.url = url;
  apiEntity.body = `
  {
    "Fields":"*",
    "PageSize":30,
    "OrderByField":"${orderFieldName}",
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
    //要查询的字段,*代表所有
    "Fields":"*",
    //页大小
    "PageSize":30,
    //页索引[-1为不分页,获取所有]
    "PageIndex":1,
    //排序字段
    "OrderByField":"",
    //字段条件
    "WhereJson":{
      //可以用哪些字段过滤请看 WhereJson详细
      "筛选字段":"字段值"
    }
  }
  `;
  const resultDataJson = `
  {
    //查询到的数据集合
    "List":Array<${getTableJson(viewModel.tabColumnStruct, { isFilter: false, spaceLen: 5 })}>,
    //总条数[注意PageIndex=-1时这个字段忽略]
    "TotalCount":100
  }
  `;
  return `> 请求 Body

${codeWapre(updateBody, 'javascript')}


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
