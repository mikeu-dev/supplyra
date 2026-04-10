import { ProjectModule } from '../project/module';
import { cache, CacheKeys } from '$lib/server/core/cache';

export class ReportingService {
	private readonly CACHE_TTL = 600; // 10 minutes

	async generateProjectReport() {
		const ExcelJS = (await import('exceljs')).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Projects Report');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 36 },
			{ header: 'Project Name', key: 'name', width: 30 },
			{ header: 'Client', key: 'client', width: 30 },
			{ header: 'Status', key: 'status', width: 15 },
			{ header: 'Start Date', key: 'startDate', width: 15 },
			{ header: 'Due Date', key: 'dueDate', width: 15 },
			{ header: 'Created At', key: 'createdAt', width: 20 }
		];

		const projectService = ProjectModule.getService();
		const { data: projects } = await projectService.getPaginatedProjects(
			1,
			1000,
			undefined,
			undefined,
			'admin'
		);

		projects.forEach((project) => {
			worksheet.addRow({
				id: project.id ? String(project.id) : '',
				name: project.name ? String(project.name) : '',
				client: project.client?.name ? String(project.client.name) : '-',
				status: project.status ? String(project.status) : '',
				// Convert dates to simple strings to avoid ExcelJS/Excel date parsing issues
				startDate: project.startDate
					? new Date(project.startDate).toISOString().split('T')[0]
					: '-',
				dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '-',
				createdAt: project.createdAt ? new Date(project.createdAt).toISOString().split('T')[0] : '-'
			});
		});

		worksheet.getRow(1).font = { bold: true };

		return await workbook.xlsx.writeBuffer();
	}

	async generateFinancialReport(startDate?: string, endDate?: string) {
		return await cache.getOrSet(
			CacheKeys.reporting.financial(startDate, endDate),
			async () => {
				const { db } = await import('$lib/server/database');
				const { invoices, expenses } = await import('$lib/server/database/schemas');
				const { and, gte, lte, eq, sql } = await import('drizzle-orm');

				// income (paid invoices)
				const incomeQuery = db
					.select({
						total: sql<number>`sum(${invoices.total})`
					})
					.from(invoices)
					.where(
						and(
							eq(invoices.status, 'paid'),
							startDate
								? gte(invoices.issueDate, new Date(startDate).toISOString().split('T')[0])
								: undefined,
							endDate
								? lte(invoices.issueDate, new Date(endDate).toISOString().split('T')[0])
								: undefined
						)
					);

				// expenses (approved/paid)
				const expenseQuery = db
					.select({
						total: sql<number>`sum(${expenses.amount})`
					})
					.from(expenses)
					.where(
						and(
							// Assuming we count approved and paid expenses
							sql`${expenses.status} IN ('approved', 'paid')`,
							startDate
								? gte(expenses.date, new Date(startDate).toISOString().split('T')[0])
								: undefined,
							endDate
								? lte(expenses.date, new Date(endDate).toISOString().split('T')[0])
								: undefined
						)
					);

				const [incomeRes, expenseRes] = await Promise.all([incomeQuery, expenseQuery]);

				const income = Number(incomeRes[0]?.total || 0);
				const expense = Number(expenseRes[0]?.total || 0);

				return {
					income,
					expense,
					profit: income - expense,
					period: { startDate, endDate }
				};
			},
			this.CACHE_TTL
		);
	}

	async getMonthlyFinancialTrends(months = 6) {
		const trends = [];
		const now = new Date();

		for (let i = months - 1; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthName = d.toLocaleString('id-ID', { month: 'short' });
			const year = d.getFullYear();

			const startDate = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
			const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();

			const report = await this.generateFinancialReport(startDate, endDate);
			trends.push({
				month: `${monthName} ${year}`,
				income: report.income,
				expense: report.expense,
				profit: report.profit
			});
		}

		return trends;
	}

	async generateProjectProfitabilityReport() {
		return await cache.getOrSet(
			CacheKeys.reporting.projectProfitability(),
			async () => {
				const { db } = await import('$lib/server/database');
				const { projects, invoices, expenses, clients } =
					await import('$lib/server/database/schemas');
				const { eq, sql, and } = await import('drizzle-orm');

				// This is a bit complex in one query, let's fetch all projects and then aggregate
				// Or use subqueries if Drizzle supports it well. For simplicity and code clarity in this context:

				const allProjects = await db
					.select({
						id: projects.id,
						name: projects.name,
						clientName: clients.name
					})
					.from(projects)
					.leftJoin(clients, eq(projects.clientId, clients.id));

				const report = [];

				for (const p of allProjects) {
					const incomeRes = await db
						.select({ val: sql<number>`sum(${invoices.total})` })
						.from(invoices)
						.where(and(eq(invoices.projectId, p.id), eq(invoices.status, 'paid')));

					const expenseRes = await db
						.select({ val: sql<number>`sum(${expenses.amount})` })
						.from(expenses)
						.where(
							and(eq(expenses.projectId, p.id), sql`${expenses.status} IN ('approved', 'paid')`)
						);

					const income = Number(incomeRes[0]?.val || 0);
					const expense = Number(expenseRes[0]?.val || 0);

					report.push({
						...p,
						income,
						expense,
						profit: income - expense,
						margin: income > 0 ? ((income - expense) / income) * 100 : 0
					});
				}

				return report;
			},
			this.CACHE_TTL
		);
	}

	async generatePayrollSummary(period?: string) {
		return await cache.getOrSet(
			CacheKeys.reporting.payroll(period),
			async () => {
				const { db } = await import('$lib/server/database');
				const { payrolls, payrollBatches } = await import('$lib/server/database/schemas');
				const { sql, eq, and } = await import('drizzle-orm');

				const conditions = [];
				if (period) {
					conditions.push(sql`to_char(${payrollBatches.period}, 'YYYY-MM') = ${period}`);
				}

				const query = db
					.select({
						totalNet: sql<number>`sum(${payrolls.netSalary})`,
						count: sql<number>`count(${payrolls.id})`,
						paidCount: sql<number>`sum(case when ${payrolls.status} = 'paid' then 1 else 0 end)`
					})
					.from(payrolls)
					.leftJoin(payrollBatches, eq(payrolls.batchId, payrollBatches.id))
					.where(and(...conditions));

				const res = await query;
				const stats = res[0] || { totalNet: 0, count: 0, paidCount: 0 };

				return {
					totalCost: Number(stats.totalNet || 0),
					employeeCount: Number(stats.count || 0),
					paidCount: Number(stats.paidCount || 0)
				};
			},
			this.CACHE_TTL
		);
	}

	async generateAttendanceSummary(startDate?: string, endDate?: string) {
		return await cache.getOrSet(
			CacheKeys.reporting.attendance(startDate, endDate),
			async () => {
				const { db } = await import('$lib/server/database');
				const { presences } = await import('$lib/server/database/schemas');
				const { sql, and, gte, lte } = await import('drizzle-orm');

				const conditions = [];
				if (startDate) conditions.push(gte(presences.time, new Date(startDate)));
				if (endDate) conditions.push(lte(presences.time, new Date(endDate)));

				const query = db
					.select({
						count: sql<number>`count(${presences.id})`,
						totalLate: sql<number>`sum(${presences.late})`,
						totalPiece: sql<number>`sum(${presences.piece})`
					})
					.from(presences)
					.where(and(...conditions));

				const res = await query;
				const stats = res[0] || { count: 0, totalLate: 0, totalPiece: 0 };

				return {
					totalPresences: Number(stats.count || 0),
					totalLateMinutes: Number(stats.totalLate || 0),
					totalPiece: Number(stats.totalPiece || 0)
				};
			},
			this.CACHE_TTL
		);
	}

	async generatePayrollReport(period?: string) {
		const ExcelJS = (await import('exceljs')).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Payroll Report');

		worksheet.columns = [
			{ header: 'Employee', key: 'name', width: 30 },
			{ header: 'Position', key: 'position', width: 20 },
			{ header: 'Base Salary', key: 'base', width: 15 },
			{ header: 'Allowance', key: 'allowance', width: 15 },
			{ header: 'Deduction', key: 'deduction', width: 15 },
			{ header: 'Net Salary', key: 'net', width: 15 },
			{ header: 'Payment Date', key: 'date', width: 15 },
			{ header: 'Status', key: 'status', width: 10 }
		];

		const { db } = await import('$lib/server/database');
		const { payrolls, employees, users, positions, payrollBatches } =
			await import('$lib/server/database/schemas');
		const { eq, sql, and } = await import('drizzle-orm');

		const conditions = [];
		if (period) {
			conditions.push(sql`to_char(${payrollBatches.period}, 'YYYY-MM') = ${period}`);
		}

		const rows = await db
			.select({
				name: users.name,
				position: positions.name,
				base: payrolls.baseSalary,
				allowance: payrolls.totalAllowance,
				deduction: payrolls.totalDeduction,
				net: payrolls.netSalary,
				date: payrolls.paidAt,
				status: payrolls.status
			})
			.from(payrolls)
			.innerJoin(employees, eq(payrolls.employeeId, employees.id))
			.innerJoin(users, eq(employees.userId, users.id))
			.leftJoin(positions, eq(employees.positionId, positions.id))
			.leftJoin(payrollBatches, eq(payrolls.batchId, payrollBatches.id))
			.where(and(...conditions));

		rows.forEach((row) => {
			worksheet.addRow({
				name: row.name,
				position: row.position,
				base: Number(row.base),
				allowance: Number(row.allowance),
				deduction: Number(row.deduction),
				net: Number(row.net),
				date: row.date ? new Date(row.date).toISOString().split('T')[0] : '-',
				status: row.status
			});
		});

		worksheet.getRow(1).font = { bold: true };
		return await workbook.xlsx.writeBuffer();
	}

	async generateAttendanceReport(startDate?: string, endDate?: string) {
		const ExcelJS = (await import('exceljs')).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Attendance Log');

		worksheet.columns = [
			{ header: 'Employee', key: 'name', width: 30 },
			{ header: 'Date', key: 'date', width: 15 },
			{ header: 'Time', key: 'time', width: 10 },
			{ header: 'Category', key: 'category', width: 10 },
			{ header: 'Type', key: 'type', width: 10 },
			{ header: 'Late (min)', key: 'late', width: 10 }
		];

		const { db } = await import('$lib/server/database');
		const { presences, users } = await import('$lib/server/database/schemas');
		const { eq, and, gte, lte } = await import('drizzle-orm');

		const conditions = [];
		if (startDate) conditions.push(gte(presences.time, new Date(startDate)));
		if (endDate) conditions.push(lte(presences.time, new Date(endDate)));

		const rows = await db
			.select({
				name: users.name,
				time: presences.time,
				category: presences.category,
				type: presences.type,
				late: presences.late
			})
			.from(presences)
			.innerJoin(users, eq(presences.userId, users.id))
			.where(and(...conditions))
			.orderBy(presences.time);

		rows.forEach((row) => {
			worksheet.addRow({
				name: row.name,
				date: new Date(row.time).toISOString().split('T')[0],
				time: new Date(row.time).toLocaleTimeString('id-ID'),
				category: row.category,
				type: row.type,
				late: row.late
			});
		});

		worksheet.getRow(1).font = { bold: true };
		return await workbook.xlsx.writeBuffer();
	}

	/**
	 * Invalidate all reporting caches
	 */
	async invalidateCache() {
		await cache.delPattern('reporting:*');
	}

	static generateCSV(data: Record<string, unknown>[], columns: { header: string; key: string }[]) {
		const headerRow = columns.map((c) => c.header).join(',');
		const rows = data.map((row) =>
			columns
				.map((c) => {
					const val = row[c.key];
					// Escape quotes and wrap in quotes if necessary
					if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
						return `"${val.replace(/"/g, '""')}"`;
					}
					return val;
				})
				.join(',')
		);

		return [headerRow, ...rows].join('\n');
	}
}
