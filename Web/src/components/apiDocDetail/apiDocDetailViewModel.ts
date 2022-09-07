import { TableApiViewModel } from '../tableApiDoc/tabApiViewModel';
import { addApiMarkDownBody } from './markdown/addMarkdown';
import { codeWapre } from './markdown/apiMarkDownHelper';
import { deleteApiMarkDownBody } from './markdown/deleteMarkdown';
import { entityMarkdownGenerate } from './markdown/entityMarkdown';
import { queryApiMarkDownBody } from './markdown/queryMarkdown';
import { updateApiMarkDownBody } from './markdown/updateAddMarkdown';

export const getApiMarkDown = (viewModel: TableApiViewModel) => {
  const { Title: title, Url: url } = viewModel.getApiAddress();
  const { tableProps } = viewModel;
  let markDownBody = ``;
  switch (viewModel.activeKey.value) {
    case 'Add':
      markDownBody = addApiMarkDownBody(viewModel, url);
      break;
    case 'Update':
      markDownBody = updateApiMarkDownBody(viewModel, url);
      break;
    case 'Delete':
      markDownBody = deleteApiMarkDownBody(viewModel, url);
      break;
    case 'Query':
      markDownBody = queryApiMarkDownBody(viewModel, url);
      break;
    case 'Entity':
      return entityMarkdownGenerate(viewModel);
  }

  return `
#### ${tableProps.TabName}数据${title}接口

> 接口地址 [POST]

${codeWapre(url, `javascript`)}

<br/>

> 请求头部列表：

| Header 名称 | 描述  | 类型 | 是否必选 |
| --- | --- | --- | --- |
| Content-Type | application/json; charset=utf-8 | String | 是 |
| Authorization | 授权凭证 | String | 是 |


<br/>


${markDownBody}`;
};
