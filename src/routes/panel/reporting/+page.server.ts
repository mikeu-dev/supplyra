import { ReportingService } from '$lib/server/modules/reporting/service';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const service = new ReportingService();
	const [financialReport, monthlyTrends, projectProfitability, payrollSummary, attendanceSummary] =
		await Promise.all([
			service.generateFinancialReport(),
			service.getMonthlyFinancialTrends(6),
			service.generateProjectProfitabilityReport(),
			service.generatePayrollSummary(),
			service.generateAttendanceSummary()
		]);

	// Calculate growth (simple trend vs previous month)
	const currentMonthTrend = monthlyTrends[monthlyTrends.length - 1];
	const prevMonthTrend = monthlyTrends[monthlyTrends.length - 2];
	const profitGrowth =
		prevMonthTrend?.profit > 0
			? ((currentMonthTrend.profit - prevMonthTrend.profit) / prevMonthTrend.profit) * 100
			: 0;

	return {
		financialReport,
		monthlyTrends,
		profitGrowth,
		projectProfitability,
		payrollSummary,
		attendanceSummary
	};
};
