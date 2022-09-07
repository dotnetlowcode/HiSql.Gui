import { BaseViewModel } from '@/helper/baseViewModel';
import { TableDataQueryRequest } from '@/serverApi/request/tableData/tableDataQueryRequest';
import { tableData } from '@/serverApi/tableInfoAPIs';

class OptionItem {
  Id = ``;

  Title = ``;

  IsSelect = false;
}

export class RefTableSelectOption {
  RefTab = ``;

  RefTextField = ``;

  RefValueField = ``;

  RefWhere = ``;
}
export class ViewData {
  optionList = [] as Array<OptionItem>;

  defaultValue = ``;

  defaultValueText = ``;
}

export class HRefTableSelectViewModel extends BaseViewModel<ViewData> {
  constructor() {
    super(new ViewData());
  }

  async init(refConfig: RefTableSelectOption) {
    const param = new TableDataQueryRequest();
    const { RefTab, RefTextField, RefValueField, RefWhere } = refConfig;
    param.TableName = RefTab;
    param.Fields = `${RefTextField},${RefValueField}`;
    param.HiSqlWhere = RefWhere;
    param.WhereJson = {};
    param.PageIndex = -1; // 获取所有数据
    const result = await tableData(param);
    const valueArray = this.viewData.defaultValue.split(`,`);
    this.viewData.optionList = (result.Data?.List ?? []).map<OptionItem>(r => {
      const tId = r[RefValueField];
      return {
        Title: r[RefTextField],
        Id: tId,
        IsSelect: valueArray.indexOf(tId) > -1,
      };
    });
  }

  /**
   * 获取当前选中值
   * @returns
   */
  getSelectValue() {
    let valueStr = ``;
    let textStr = ``;
    this.viewData.optionList.forEach(r => {
      if (r.IsSelect) {
        valueStr += `${r.Id},`;
        textStr += `${r.Title},`;
      }
    });
    return {
      valueStr,
      textStr,
    };
  }
}
