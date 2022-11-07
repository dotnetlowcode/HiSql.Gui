import { Router } from 'vue-router';

import { dashboardDetail } from '@/router';
import { createDashboard } from '@/serverApi/chartAPIs';

export class DashboardViewModel {
  showTitlePanel = false;

  dashboardName = ``;

  async okFun(router: Router) {
    const obj = await createDashboard(this.dashboardName);
    router.push({
      name: dashboardDetail,
      params: {
        id: obj.DBId,
      },
    });
  }
}
