import { getDashboardUrl } from '@/router';
import {
  getDashboardCharts,
  getDashboardInfo,
  getTableDashboard,
  GridLayoutItem,
  saveChartPosition,
} from '@/serverApi/chartAPIs';
import { getSearchColumns, searchParamToWhereJson } from '@/serverApi/dataHelper';
import { HiChartDashboardEntity } from '@/serverApi/models/chartModel/HiDashboardEntity';
import { ColumnStruct, fieldSortFun } from '@/serverApi/models/columnStruct';
import { TableGetColumnsRequest } from '@/serverApi/request/table/tableGetColums';
import { apiError, getTableColumns } from '@/serverApi/tableInfoAPIs';

import { SearchFromVue } from '../columsTypes/searchFrom/searchFromViewModel';
import { ChartDataModel } from './chartHelper/ichart';
import { ChartShowVue } from './chartShow/chartShowViewModel';

import { Dictionary } from '@/helper/arrayHelper';

export class DashboardViewModelBase {
  /**
   * ChartShow.vue 映射
   */
  domMap: Dictionary<string, ChartShowVue> = {};

  SetDomMap(chartId: string, chartShowInstance: ChartShowVue) {
    this.domMap[chartId] = chartShowInstance;
  }

  async MoveChart(item: GridLayoutItem, newX: number, newY: number) {
    await saveChartPosition(item.i, item);
  }

  async ResizedEvent(
    item: GridLayoutItem,
    newX: number,
    newY: number,
    newHPx: number,
    newWPx: number,
  ) {
    await saveChartPosition(item.i, item);
    this.domMap[item.i]?.resize();
  }

  FullChartId = ``;

  FullChartTitle = ``;

  FullChartShow = false;

  async FullShow(item: ChartDataModel) {
    this.FullChartId = item.ChartId;
    this.FullChartTitle = item.Title;
    this.FullChartShow = true;
  }

  /**
   * 是否加载中
   */
  Loading = true;
}

export class TableChartViewModel extends DashboardViewModelBase {
  constructor(tableName: string, public DashboardId: string = ``) {
    super();
    this.TableName = tableName;
  }

  TableName: string;

  Charts: Array<GridLayoutItem> = [];

  Dashboard: HiChartDashboardEntity = new HiChartDashboardEntity();

  TempTableName = ``;

  /**
   * 分享地址
   */
  SharedUrl = ``;

  async Init() {
    if (this.TableName) {
      this.Dashboard = await getTableDashboard(this.TableName);
    } else if (this.DashboardId) {
      const tempObj = await getDashboardInfo({ dashboardId: this.DashboardId });
      if (!tempObj) {
        throw `看板不存在!`;
      }
      this.Dashboard = tempObj;
      // eslint-disable-next-line no-self-assign
      this.TableName = tempObj.TableName;
    }
    const sharedUrlStr = getDashboardUrl(this.Dashboard.DBId);
    // eslint-disable-next-line no-restricted-globals
    this.SharedUrl = `${location.origin}${location.pathname}#${sharedUrlStr}`;
    const chartList = await getDashboardCharts(this.Dashboard.DBId);
    let len = 0;
    const gridItems = chartList.map(chartObj => {
      if (chartObj.Position) {
        return JSON.parse(chartObj.Position) as GridLayoutItem;
      }
      const obj = new GridLayoutItem(chartObj.ChartId);
      obj.x = len % 2 === 0 ? 0 : this.ColNum / 2;
      obj.y = Math.floor(len / 2);
      obj.w = 6;
      obj.h = 2;
      len += 1;
      return obj;
    });
    this.Charts = [...gridItems];
    await this.LoadColumns();
  }

  TableFields: Array<ColumnStruct> = [];

  SearchFields: Array<ColumnStruct> = [];

  async LoadColumns() {
    const req = new TableGetColumnsRequest();
    req.TableName = this.TableName;
    const { Data: data } = await getTableColumns(req);
    if (!data) {
      throw apiError;
    }
    data.TabColumnStruct?.sort(fieldSortFun);
    // TableFields不要直接赋值,不然会失去引用
    this.TableFields.length = 0;
    this.TableFields.push(...data.TabColumnStruct);
    this.SearchFields = getSearchColumns(data.TabColumnStruct);
  }

  ShowAddChart = false;

  /**
   * 是否保存中
   */
  Saveing = false;

  /**
   * 列的数量
   */
  private ColNum = 12;

  /**
   * 增加一个新图表
   * @param chartId
   */
  AddItem(chartId: string) {
    const len = this.Charts.length;
    const obj = new GridLayoutItem(chartId);
    obj.x = len % 2 ? 0 : this.ColNum / 2;
    obj.y = Math.floor(len / 2);
    obj.w = 6;
    obj.h = 2;
    this.Charts.push(obj);
    saveChartPosition(obj.i, obj);
  }

  Refresh(chartId: string) {
    this.domMap[chartId]?.reload();
  }

  /**
   * 编辑图表Id
   */
  EditChartId = ``;

  async OpenEditChart(chartId: string) {
    this.EditChartId = chartId;
    this.ShowAddChart = true;
  }

  async DeleteChart(item: GridLayoutItem) {
    const itemIndex = this.Charts.indexOf(item);
    this.Charts.splice(itemIndex, 1);
    delete this.domMap[item.i];
  }

  ShowSearchFrom = false;

  SearchFromObj?: SearchFromVue;

  /**
   * 搜索
   * @param searchParam
   */
  SearchFrom(searchParam: Dictionary<string, any>) {
    const searchWhere = searchParamToWhereJson(this.TableFields, searchParam);
    for (const key in this.domMap) {
      this.domMap[key]?.reload(searchWhere);
    }
  }

  /**
   * 新增图表
   */
  AddNewChart() {
    this.ShowAddChart = true;
    this.EditChartId = '';
  }
}
