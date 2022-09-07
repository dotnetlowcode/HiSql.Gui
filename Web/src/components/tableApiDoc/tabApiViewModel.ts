import { Ref } from 'vue';
import {
  apiError,
  getTableColumns,
  getTableProp,
  TablePropEntity,
} from '../../serverApi/tableInfoAPIs';
import { ColumnStruct, fieldSortFun } from '../../serverApi/models/columnStruct';
import { TableGetColumnsRequest } from '../../serverApi/request/table/tableGetColums';
import config from '@/serverApi/config';
import { getTableOrderFields } from '../apiDocDetail/markdown/apiMarkDownHelper';

/**
 * 表基本的API类型
 */
export type ApiBaseType = 'Add' | 'Update' | 'Query' | 'Delete' | 'Entity';

class ApiEntityField {
  /**
   * 参数名
   */
  Name = ``;

  /**
   * 参数描述
   */
  Desc = ``;

  /**
   * 是否为必填参数
   */
  IsRequired = false;
}

export class ApiDocModel {
  /**
   * 请求地址
   */
  Url = ``;

  /**
   * 请求类型
   */
  ContentType: 'text/plain' | 'application/json' = `application/json`;

  /**
   * 接口名
   */
  Title = ``;

  /**
   * 接口描述
   */
  Description = ``;

  /**
   * 请求方式
   */
  Method: 'POST' | 'GET' = 'POST';

  /**
   * 请求参数
   */
  InputParam: Array<ApiEntityField> = [];

  /**
   * 响应参数
   */
  OutputParam: Array<ApiEntityField> = [];

  /**
   * 请求示例代码
   */
  RequestDemoCode = '';

  /**
   * 响应示例代码
   */
  ResponseDemoCode = '';
}

export class TableApiViewModel {
  tableName: string;

  tabColumnStruct: Array<ColumnStruct> = reactive([]);

  tableProps = reactive(new TablePropEntity());

  activeKey: Ref<ApiBaseType | ``> = ref(``);

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * 加载表数据信息
   */
  async loadTableInfo() {
    const req = new TableGetColumnsRequest();
    req.TableName = this.tableName;
    const { Data: data } = await getTableColumns(req);
    if (!data) {
      throw apiError;
    }
    data.TabColumnStruct?.sort(fieldSortFun);
    this.tabColumnStruct.push(...(data.TabColumnStruct ?? []));
    Object.assign(this.tableProps, await getTableProp(this.tableName));
    this.activeKey.value = 'Add';
  }

  /**
   * 获取API地址
   * @param tableName 表名
   * @param apiType api类型
   * @returns
   */
  getApiAddress() {
    let title = ``;
    let url = ``;
    switch (this.activeKey.value) {
      case 'Add':
        title = `新增`;
        url = `/hidata/api/data/${this.tableName}/add`;
        break;
      case 'Delete':
        title = `删除`;
        url = `/hidata/api/data/${this.tableName}/delete`;
        break;
      case 'Query':
        title = `查询`;
        url = `/hidata/api/data/${this.tableName}/query`;
        break;
      case 'Update':
        title = `更新`;
        url = `/hidata/api/data/${this.tableName}/update`;
        break;
    }

    return {
      Title: title,
      Url: config.ApiConfig.ApiHost + url,
    };
  }

  /**
   * 获取可排序的字段
   * @returns
   */
  getOrderFields() {
    return getTableOrderFields(this.tabColumnStruct);
  }
}
