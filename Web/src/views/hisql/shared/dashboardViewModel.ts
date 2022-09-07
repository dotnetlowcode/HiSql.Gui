import { DashboardViewModelBase } from '@/components/tableChart/tableChartViewModel';
import { getDashboardCharts, GridLayoutItem } from '@/serverApi/chartAPIs';

export class DashboardSharedViewModel extends DashboardViewModelBase {
  DashboardId: string;

  Charts: GridLayoutItem[] = [];

  constructor(dashboardId: string) {
    super();
    this.DashboardId = dashboardId;
  }

  /**
   * 列的数量
   */
  private ColNum = 12;

  async Init() {
    const chartList = await getDashboardCharts(this.DashboardId);
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
  }
}
