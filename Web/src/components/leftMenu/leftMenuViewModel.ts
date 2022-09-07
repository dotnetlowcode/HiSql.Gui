import { List } from 'linqts';
import { Router } from 'vue-router';

import {
  addBlockApiRouterName,
  addExcelExportTemplateRouterName,
  addTableRouterName,
  addTableTaskRouterName,
  addViewTableRouterName,
} from '@/router';
import { getApiList, getTables } from '@/serverApi/databaseAPIs';
import { GetExcelExportTemplateList } from '@/serverApi/request/excelExport/hiExcelExportAPIs';
import { getTableTaskList } from '@/serverApi/request/hiTask/hiTableTaskAPIs';

export class SelectItemType {
  Id?: string;
}
export type dataItem = { Name: string; Id: string };
type searchFun = () => Array<dataItem>;
type dataArray = Array<dataItem>;
type goType = (router: Router, item: dataItem) => void;
type authConfig = {
  Add: {
    ResId: string;
    OperateId: string;
  };
  Delete: {
    ResId: string;
    OperateId: string;
  };
};
export class ModuleItem {
  constructor(
    name: string,
    loadData: () => Promise<dataItem[]>,
    goPage: goType,
    addRouterName: string,
    iconName: string,
    authConfig: authConfig,
  ) {
    this.Name = name;
    this.LoadData = loadData;
    this.GoPage = goPage;
    this.AddRouterName = addRouterName;
    this.IconName = iconName;
    this.AuthConfig = authConfig;
  }

  Name = ``;

  IconName = ``;

  /**
   * 新增页面的路由名
   */
  AddRouterName = ``;

  Childrens: dataArray = [];

  FilterData: dataArray = [];

  SearchKey = ``;

  AuthConfig = {
    /**
     * 新增权限配置
     */
    Add: {
      ResId: ``,
      OperateId: ``,
    },
    /**
     * 删除权限配置
     */
    Delete: {
      ResId: ``,
      OperateId: ``,
    },
  };

  SearchFun: searchFun = () => {
    debugger;
    const self = this as ModuleItem;
    const key = this.SearchKey.toLowerCase();
    if (key === ``) {
      return self.Childrens;
    }
    const findResult = self.Childrens.filter(current => {
      return current.Name.toLowerCase().indexOf(key) > -1;
    });
    return findResult;
  };

  LoadData: () => Promise<dataArray>;

  GoPage: goType;
}

export class LeftMenuViewModel {
  init() {
    this.initTableItem();
    this.initViewTableItem();
    this.initApiTableItem();

    // this.initCharts();
    this.intTableTask();
    this.initExcelTemplate();
    if (this.TreeDatas.length < 1) {
      return;
    }
    this.TreeDatas.forEach(self => {
      self.LoadData().then(list => {
        self.Childrens = list ?? [];
        self.FilterData.push(...list);
      }); // 加载数据
    });
    const [firstObj] = this.TreeDatas;
    this.SelectTreeItem = firstObj;
    // Object.assign(this.SelectTreeItem, firstObj);
    (window as any).selfModel = this;
  }

  ActiveKey = `数据表`;

  SelectItem: SelectItemType = {};

  SelectTreeItem: ModuleItem = {} as any;

  SelectResId = ``;

  SelectOperateId = ``;

  SetSelectTreeItemByName(treeItemName: string) {
    for (let index = 0; index < this.TreeDatas.length; index++) {
      const element = this.TreeDatas[index];
      if (element.Name === treeItemName) {
        this.SelectTreeItem = element;
        // Object.assign(this.SelectTreeItem, element);
        break;
      }
    }
  }

  TreeDatas: Array<ModuleItem> = [];

  private initTableItem() {
    this.TreeDatas.push(
      new ModuleItem(
        `数据表`,
        async () => {
          const tableResult = await getTables(0);
          return new List(tableResult)
            .Select(table => {
              return {
                Name: table.TabName,
                Id: table.TabName,
              };
            })
            .ToArray();
        },
        (route, dItem) => {
          route.push({
            name: `tableDetail`,
            params: {
              tableName: dItem.Name,
            },
          });
        },
        addTableRouterName,
        'icon-a-HiSqlGUIICON_shujubiao',
        {
          Add: { ResId: `Hi_TabModel`, OperateId: `hiTable-list-add` },
          Delete: { ResId: `Hi_TabModel`, OperateId: `hiTable-list-delete` },
        },
      ),
    );
  }

  private initViewTableItem() {
    this.TreeDatas.push(
      new ModuleItem(
        `视图`,
        async () => {
          const tableResult = await getTables(1);
          return new List(tableResult)
            .Select(table => {
              return {
                Name: table.TabName,
                Id: table.TabName,
              };
            })
            .ToArray();
        },
        (route, dItem) => {
          route.push({
            name: `tableViewDetail`,
            params: {
              viewName: dItem.Name,
            },
          });
        },
        addViewTableRouterName,
        'icon-a-HiSqlGUIICON_shitu',
        {
          Add: { ResId: `Hi_TabModel`, OperateId: `hiTable-list-add` },
          Delete: { ResId: `Hi_TabModel`, OperateId: `hiTable-list-delete` },
        },
      ),
    );
  }

  private initApiTableItem() {
    this.TreeDatas.push(
      new ModuleItem(
        `数据接口`,
        async () => {
          const tableResult = await getApiList();
          return new List(tableResult)
            .Select(apiObj => {
              return {
                Name: `${apiObj.GroupName}-${apiObj.Name}`,
                Id: apiObj.ApiId,
              };
            })
            .ToArray();
        },
        (route, dItem) => {
          route.push({
            name: `tableApiDetail`,
            params: {
              id: dItem.Id,
            },
          });
        },
        addBlockApiRouterName,
        'icon-a-HiSqlGUIICON_jiekouAPI',
        {
          Add: {
            ResId: `Hi_Api`,
            OperateId: `hiApi-list-add`,
          },
          Delete: {
            ResId: `Hi_Api`,
            OperateId: `hiApi-list-delete`,
          },
        },
      ),
    );
  }

  private intTableTask() {
    this.TreeDatas.push(
      new ModuleItem(
        `数据任务`,
        async () => {
          const tableResult = await getTableTaskList();
          return new List(tableResult)
            .Select(taskObj => {
              return {
                Name: taskObj.Title,
                Id: taskObj.TaskId,
              };
            })
            .ToArray();
        },
        (route, dItem) => {
          route.push({
            name: `tableTaskDetail`,
            params: {
              taskId: dItem.Id,
            },
          });
        },
        addTableTaskRouterName,
        'icon-a-HiSqlGUIICON_biaorenwu',
        {
          Add: {
            ResId: `Hi_Task`,
            OperateId: `hiTask-list-add`,
          },
          Delete: {
            ResId: `Hi_Task`,
            OperateId: `hiTask-list-add`,
          },
        },
      ),
    );
  }

  private initExcelTemplate() {
    this.TreeDatas.push(
      new ModuleItem(
        `数据导出`,
        async () => {
          const tableResult = await GetExcelExportTemplateList();
          return new List(tableResult)
            .Select(taskObj => {
              return {
                Name: taskObj.Title,
                Id: taskObj.TemplateId,
              };
            })
            .ToArray();
        },
        (route, dItem) => {
          debugger;
          route.push({
            name: `editExportExcel`,
            params: {
              Id: dItem.Id,
            },
          });
        },
        addExcelExportTemplateRouterName,
        'icon-daochu',
        {
          Add: {
            ResId: `Hi_ExcelExportTemplate`,
            OperateId: `hiExcelTemplate-list-add`,
          },
          Delete: {
            ResId: `Hi_ExcelExportTemplate`,
            OperateId: `hiExcelTemplate-list-delete`,
          },
        },
      ),
    );
  }

  // private initCharts() {
  //   this.TreeDatas.push(
  //     new ModuleItem(
  //       '图表',
  //       async () => {
  //         return [];
  //       },
  //       () => {},
  //     ),
  //   );
  // }

  search(item: ModuleItem) {
    debugger;
    const resultItems = item.SearchFun();
    item.FilterData.splice(0);
    if (resultItems.length > 0) {
      item.FilterData.push(...resultItems);
    }
  }
}
