import hljs from 'highlight.js';
import { Random } from 'mockjs';
import { List } from 'linqts';
import { Dictionary } from '@/helper/arrayHelper';
import { HiApiBlockEntity } from '@/serverApi/models/tableModel/hiApiBlockEntity';
import { HiApiParamEntity, ParamFieldType } from '@/serverApi/models/tableModel/hiApiFields';
import { ApiTestExcute } from '@/serverApi/databaseAPIs';

export class ApiBlockViewModel {
  constructor() {
    this.setResultJson(null);
  }

  fill(blockData: ApiBlockViewModel) {
    Object.assign(this.BlockObj, blockData.BlockObj);
    this.setResultJson(
      blockData.BlockObj.TestResult ? JSON.parse(blockData.BlockObj.TestResult) : null,
    );
    this.ApiInParamList.length = 0;
    this.ApiInParamList.push(...blockData.ApiInParamList);
    this.ApiOutParamList.length = 0;
    this.ApiOutParamList.push(...blockData.ApiOutParamList);
  }

  BlockObj: HiApiBlockEntity = reactive(new HiApiBlockEntity());

  /**
   * 模块入参
   */
  ApiInParamList: Array<HiApiParamEntity> = reactive([]);

  /**
   * 模块出参
   */
  ApiOutParamList: Array<HiApiParamEntity> = reactive([]);

  private getPropParamType(propValue: any): ParamFieldType {
    //
    const valueType = typeof propValue;
    // 检测是否是日期类型
    if (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{2}$/.test(propValue)) {
      return ParamFieldType.Date;
    }
    switch (valueType) {
      case 'boolean':
        return ParamFieldType.Boolean;
      case 'number':
      case 'bigint':
        return ParamFieldType.Number;
      default:
        return ParamFieldType.String;
    }
  }

  ResultCode = ref(``);

  setResultJson(result: any) {
    if (!result) {
      result = {
        Message: `还未执行任何结果!`,
      };
    }
    const resultJson = JSON.stringify(result, null, 2);
    this.ResultCode.value = `<pre class="hljs"><code>${
      hljs.highlight(`JSON`, resultJson, true).value
    }</code></pre>`;
  }

  /**
   * 测试模块
   */
  async TestExceute() {
    const param: Dictionary<string, string> = {};
    this.ApiInParamList.forEach(f => {
      param[f.Title] = f.DemoValue;
    });
    const result = await ApiTestExcute(this.BlockObj.Sql, param, {
      hiSqlparam: {},
    });
    const rows = result.Data?.List ?? [];
    this.setResultJson(result);
    if (result.Data && rows.length > 1) {
      result.Data.List = [rows[0]];
    }
    this.BlockObj.TestResult = JSON.stringify(result, null, 2);
    if (rows.length > 0) {
      const firstRow = rows[0];
      this.ApiOutParamList.length = 0;
      for (const key in firstRow) {
        if (Object.prototype.hasOwnProperty.call(firstRow, key)) {
          const propValue = firstRow[key];
          const outParam = new HiApiParamEntity();
          outParam.Title = key;
          outParam.FieldType = 'Out';
          outParam.ApiBodyId = this.BlockObj.ApiBodyId;
          outParam.ApiId = this.BlockObj.ApiId;
          outParam.Type = this.getPropParamType(propValue);
          outParam.DemoValue = propValue ?? Random.cname();
          outParam.Description = outParam.Title;
          this.ApiOutParamList.push(outParam);
        }
      }
    }
  }

  static pageFields: Array<{
    Title: string;
    DefaultValue: any;
  }> = [
    {
      Title: `PageIndex`,
      DefaultValue: 1,
    },
    {
      Title: `PageSize`,
      DefaultValue: 10,
    },
    {
      Title: `OrderByField`,
      DefaultValue: ``,
    },
  ];

  /**
   * 打开或关闭分页功能
   */
  PageChange() {
    const tempInParams = new List<HiApiParamEntity>(this.ApiInParamList);
    if (this.BlockObj.IsPageList) {
      for (const fIndex in ApiBlockViewModel.pageFields) {
        const { Title, DefaultValue } = ApiBlockViewModel.pageFields[fIndex];
        if (!tempInParams.Any(r => r?.Title === Title)) {
          const fieldObj = new HiApiParamEntity();
          fieldObj.Title = Title;
          fieldObj.FieldType = 'In';
          fieldObj.ApiBodyId = this.BlockObj.ApiBodyId;
          fieldObj.ApiId = this.BlockObj.ApiId;
          fieldObj.DefaultValue = DefaultValue;
          fieldObj.Type = ParamFieldType.Number;
          if (Title === 'OrderByField') {
            fieldObj.Type = ParamFieldType.String;
          }
          this.ApiInParamList.push(fieldObj);
        }
      }
    } else {
      for (const fIndex in ApiBlockViewModel.pageFields) {
        const { Title } = ApiBlockViewModel.pageFields[fIndex];
        const obj = tempInParams.FirstOrDefault(r => r?.Title === Title);
        if (obj) {
          const indexNum = this.ApiInParamList.indexOf(obj);
          this.ApiInParamList.splice(indexNum, 1);
        }
      }
    }
  }
}
