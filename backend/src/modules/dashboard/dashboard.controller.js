import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getStats(req, res) {
    const stats = await dashboardService.getStats();
    res.json({ success: true, data: stats });
  },

  async getCharts(req, res) {
    const charts = await dashboardService.getChartsData();
    res.json({ success: true, data: charts });
  }
};
