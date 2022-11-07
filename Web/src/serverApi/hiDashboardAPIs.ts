import { HiApiExcuteApi } from './hiApiAPIs';
import { HiAuthorityAPIs } from './hiAuthorityAPIs';
import { HiChartDashboardEntity } from './models/chartModel/HiDashboardEntity';
import { TableDataQueryRequest } from './request/tableData/tableDataQueryRequest';
import { tableDataQuery } from './tableDataAPIs';

const dashboardTableName = `Hi_ChartDashboard`;

export class HiDashboardAPIs {
  static async getDashboardList() {
    const dashboardListApiId = `ca5cc810-c9e7-40a6-908a-d0c9cc0ad927`;
    const result = await HiApiExcuteApi(dashboardListApiId, {});
    return result.Default.Table as Array<HiChartDashboardEntity>;
  }
}
