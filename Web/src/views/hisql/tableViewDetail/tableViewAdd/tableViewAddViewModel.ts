import { Dictionary } from '@/helper/arrayHelper';
import hljs from 'highlight.js';
import { ApiTestExcute } from '@/serverApi/databaseAPIs';
import { createTableView } from '@/serverApi/tableInfoAPIs';

export class TableViewAddViewModel {
  IsLoad = true;

  async Init() {
    this.IsLoad = false;
  }

  Sql = ``;

  TableName = ``;

  ResultCode = ``;

  setResultJson(result: any) {
    if (!result) {
      result = {
        Message: `还未执行任何结果!`,
      };
    }
    const resultJson = JSON.stringify(result, null, 2);
    this.ResultCode = `<pre class="hljs"><code>${
      hljs.highlight(`JSON`, resultJson, true).value
    }</code></pre>`;
  }

  Top = 10;

  /**
   * 测试模块
   */
  async testExceute() {
    const param: Dictionary<string, string> = {};
    const result = await ApiTestExcute(this.Sql, param, {
      pageSize: this.Top,
      pageIndex: 1,
    });
    this.setResultJson(result);
  }

  /**
   * 保存视图信息
   * @returns
   */
  async saveTableView() {
    if (this.TableName.length < 1 || this.Sql.length < 1) {
      throw `视图名或者视图创建HiSql不能为空!`;
    }
    return createTableView(this.TableName, this.Sql);
  }
}
