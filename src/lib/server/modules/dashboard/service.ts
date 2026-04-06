import { db } from '$lib/server/database';
import { users } from '$lib/server/database/schemas/users';
import { projects } from '$lib/server/database/schemas/projects';
import { tasks } from '$lib/server/database/schemas/tasks';
import { projectColumns } from '$lib/server/database/schemas/project-columns';
import { clients } from '$lib/server/database/schemas/clients';
import { invoices } from '$lib/server/database/schemas/invoices';
import { expenses } from '$lib/server/database/schemas/expenses';
import { employees } from '$lib/server/database/schemas/employees';
import { timesheets } from '$lib/server/database/schemas/timesheets';
import { purchaseOrders } from '$lib/server/database/schemas/purchase/orders';

import { count, sum, sql, desc, gte, and, eq, inArray } from 'drizzle-orm';
import { cache, CacheKeys } from '$lib/server/core/cache';

export class DashboardService {
	private readonly CACHE_TTL = 300; // 5 minutes

	async getStats(companyId?: string) {
		return await cache.getOrSet(
			CacheKeys.dashboard.stats(companyId),
			async () => {
				if (companyId) {
					const [[userCount], [projectCount], [clientCount], [taskCount]] = await Promise.all([
						db
							.select({ count: count() })
							.from(users)
							.innerJoin(employees, eq(users.id, employees.userId))
							.where(eq(employees.companyId, companyId)),
						db
							.select({ count: count() })
							.from(projects)
							.innerJoin(clients, eq(projects.clientId, clients.id))
							.where(eq(clients.companyId, companyId)),
						db.select({ count: count() }).from(clients).where(eq(clients.companyId, companyId)),
						db
							.select({ count: count() })
							.from(tasks)
							.innerJoin(projects, eq(tasks.projectId, projects.id))
							.innerJoin(clients, eq(projects.clientId, clients.id))
							.where(eq(clients.companyId, companyId))
					]);

					return {
						users: userCount.count,
						projects: projectCount.count,
						clients: clientCount.count,
						tasks: taskCount.count
					};
				}

				const [[userCount], [projectCount], [clientCount], [taskCount]] = await Promise.all([
					db.select({ count: count() }).from(users),
					db.select({ count: count() }).from(projects),
					db.select({ count: count() }).from(clients),
					db.select({ count: count() }).from(tasks)
				]);

				return {
					users: userCount.count,
					projects: projectCount.count,
					clients: clientCount.count,
					tasks: taskCount.count
				};
			},
			this.CACHE_TTL
		);
	}

	async getComproStats(companyId?: string) {
		return await cache.getOrSet(
			`dashboard:compro_stats:${companyId || 'global'}`,
			async () => {
				const { news } = await import('$lib/server/database/schemas/news');
				const { services } = await import('$lib/server/database/schemas/services');
				const { jobs } = await import('$lib/server/database/schemas/jobs');
				const { contacts } = await import('$lib/server/database/schemas/contacts');

				const [[portfolioCount], [newsCount], [serviceCount], [jobCount], [contactCount]] =
					await Promise.all([
						companyId
							? db
									.select({ count: count() })
									.from(projects)
									.innerJoin(clients, eq(projects.clientId, clients.id))
									.where(eq(clients.companyId, companyId))
							: db.select({ count: count() }).from(projects),
						db.select({ count: count() }).from(news),
						db
							.select({ count: count() })
							.from(services)
							.where(companyId ? eq(services.companyId, companyId) : undefined),
						db.select({ count: count() }).from(jobs),
						db.select({ count: count() }).from(contacts)
					]);

				return {
					portfolios: portfolioCount.count,
					news: newsCount.count,
					services: serviceCount.count,
					jobs: jobCount.count,
					messages: contactCount.count
				};
			},
			this.CACHE_TTL
		);
	}

	async getProjectStatusStats(companyId?: string) {
		return await cache.getOrSet(
			CacheKeys.dashboard.projectStatus(companyId),
			async () => {
				let query = db
					.select({
						status: projects.status,
						count: count()
					})
					.from(projects);

				if (companyId) {
					query = query
						.innerJoin(clients, eq(projects.clientId, clients.id))
						.where(eq(clients.companyId, companyId)) as unknown as typeof query;
				}

				return await query.groupBy(projects.status);
			},
			this.CACHE_TTL
		);
	}

	async getTaskStatusStats(companyId?: string) {
		return await cache.getOrSet(
			CacheKeys.dashboard.taskStatus(companyId),
			async () => {
				let query = db
					.select({
						status: projectColumns.name,
						count: count()
					})
					.from(tasks)
					.leftJoin(projectColumns, eq(tasks.columnId, projectColumns.id));

				if (companyId) {
					query = query
						.innerJoin(projects, eq(tasks.projectId, projects.id))
						.innerJoin(clients, eq(projects.clientId, clients.id))
						.where(eq(clients.companyId, companyId)) as unknown as typeof query;
				}

				return await query.groupBy(projectColumns.name);
			},
			this.CACHE_TTL
		);
	}

	async getRecentActivities(limit = 5, companyId?: string) {
		return await cache.getOrSet(
			CacheKeys.dashboard.activities(limit, companyId),
			async () => {
				const { activityLogs } = await import('$lib/server/database/schemas/activity-logs');

				let baseQuery = db
					.select({
						id: activityLogs.id,
						userId: activityLogs.userId,
						action: activityLogs.action,
						entityType: activityLogs.entityType,
						entityId: activityLogs.entityId,
						meta: activityLogs.meta,
						ipAddress: activityLogs.ipAddress,
						userAgent: activityLogs.userAgent,
						before: activityLogs.before,
						after: activityLogs.after,
						createdAt: activityLogs.createdAt,
						userName: users.name,
						userUsername: users.username
					})
					.from(activityLogs)
					.leftJoin(users, eq(activityLogs.userId, users.id));

				if (companyId) {
					// NOTE: This creates a potential leak where activities of a user in Company B
					// are visible in Company A's dashboard if the user belongs to both.
					// Ideally activityLogs should have companyId.
					baseQuery = baseQuery
						.innerJoin(employees, eq(activityLogs.userId, employees.userId))
						.where(eq(employees.companyId, companyId)) as unknown as typeof baseQuery;
				}

				const results = await baseQuery.orderBy(desc(activityLogs.createdAt)).limit(limit);

				return results.map((log) => ({
					id: log.id,
					userId: log.userId,
					action: log.action,
					entityType: log.entityType,
					entityId: log.entityId,
					meta: log.meta,
					ipAddress: log.ipAddress,
					userAgent: log.userAgent,
					before: log.before,
					after: log.after,
					createdAt: log.createdAt,
					user: {
						name: log.userName,
						username: log.userUsername
					}
				}));
			},
			60 // 1 minute cache for recent activities
		);
	}

	/**
	 * Get revenue trends for the last N months
	 */
	async getRevenueTrends(months = 6, companyId?: string) {
		return await cache.getOrSet(
			`dashboard:revenue_trends:${months}:${companyId || 'global'}`,
			async () => {
				// Helper to generate last N months
				const getLastNMonths = (n: number) => {
					const months = [];
					const today = new Date();
					for (let i = n - 1; i >= 0; i--) {
						const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
						const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
						months.push(monthStr);
					}
					return months;
				};

				const formatDate = (date: Date) => {
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				};

				const monthList = getLastNMonths(months);
				const startDate = new Date();
				startDate.setMonth(startDate.getMonth() - months);
				startDate.setDate(1); // Set to beginning of the month

				let query = db
					.select({
						month: sql<string>`to_char(${invoices.issueDate}, 'YYYY-MM')`,
						revenue: sum(invoices.total)
					})
					.from(invoices);

				const conditions = [
					sql`${invoices.issueDate} >= ${formatDate(startDate)}`,
					sql`${invoices.status} IN ('paid', 'partially_paid')`
				];

				if (companyId) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					query = query.innerJoin(clients, eq(invoices.clientId, clients.id)) as any;
					conditions.push(eq(clients.companyId, companyId));
				}

				const results = await query
					.where(and(...conditions))
					.groupBy(sql`to_char(${invoices.issueDate}, 'YYYY-MM')`)
					.orderBy(sql`to_char(${invoices.issueDate}, 'YYYY-MM')`);

				const resultMap = new Map(results.map((r) => [r.month, parseFloat(r.revenue || '0')]));

				return monthList.map((month) => ({
					month,
					revenue: resultMap.get(month) || 0
				}));
			},
			this.CACHE_TTL
		);
	}

	/**
	 * Get project profitability analysis
	 */
	async getProjectProfitability(limit = 10, companyId?: string) {
		return await cache.getOrSet(
			`dashboard:project_profitability_v3:${limit}:${companyId || 'global'}`,
			async () => {
				// We'll use a more robust way by fetching projects and their related costs
				// 1. Get Projects
				let projectQuery = db
					.select({
						id: projects.id,
						name: projects.name,
						clientId: projects.clientId
					})
					.from(projects);

				if (companyId) {
					projectQuery = projectQuery
						.innerJoin(clients, eq(projects.clientId, clients.id))
						.where(eq(clients.companyId, companyId)) as unknown as typeof projectQuery;
				}

				const baseProjects = await projectQuery.limit(limit);
				if (baseProjects.length === 0) return [];

				const projectIds = baseProjects.map((p) => p.id);

				// 2. Get Revenue
				const revenueResults = await db
					.select({
						projectId: invoices.projectId,
						total: sum(invoices.total)
					})
					.from(invoices)
					.where(
						and(inArray(invoices.projectId, projectIds), sql`${invoices.status} != 'cancelled'`)
					)
					.groupBy(invoices.projectId);

				// 3. Get Labor Costs
				const laborResults = await db
					.select({
						projectId: timesheets.projectId,
						totalCost: sql<number>`SUM(${timesheets.hours} * ${employees.hourlyRate})`
					})
					.from(timesheets)
					.innerJoin(users, eq(timesheets.userId, users.id))
					.innerJoin(employees, eq(users.id, employees.userId))
					.where(inArray(timesheets.projectId, projectIds))
					.groupBy(timesheets.projectId);

				// 4. Get Procurement Costs
				const procurementResults = await db
					.select({
						projectId: purchaseOrders.projectId,
						total: sum(purchaseOrders.total)
					})
					.from(purchaseOrders)
					.where(
						and(
							inArray(purchaseOrders.projectId, projectIds),
							sql`${purchaseOrders.state} != 'cancelled'`
						)
					)
					.groupBy(purchaseOrders.projectId);

				const revenueMap = new Map(
					revenueResults.map((r) => [r.projectId, parseFloat(r.total || '0')])
				);
				const laborMap = new Map(
					laborResults.map((r) => [r.projectId, parseFloat(String(r.totalCost || '0'))])
				);
				const procurementMap = new Map(
					procurementResults.map((r) => [r.projectId, parseFloat(r.total || '0')])
				);

				return baseProjects
					.map((p) => {
						const revenue = revenueMap.get(p.id) || 0;
						const laborCost = laborMap.get(p.id) || 0;
						const procurementCost = procurementMap.get(p.id) || 0;
						const totalCost = laborCost + procurementCost;
						const profit = revenue - totalCost;

						return {
							projectId: p.id,
							projectName: p.name,
							revenue,
							laborCost,
							procurementCost,
							totalCost,
							profit,
							margin: revenue > 0 ? (profit / revenue) * 100 : 0
						};
					})
					.sort((a, b) => b.profit - a.profit);
			},
			this.CACHE_TTL
		);
	}

	async getFinancialSummary(companyId?: string) {
		return await cache.getOrSet(
			`dashboard:financial_summary:${companyId || 'global'}`,
			async () => {
				const profitability = await this.getProjectProfitability(100, companyId);

				const totalRevenue = profitability.reduce((sum, p) => sum + p.revenue, 0);
				const totalCost = profitability.reduce((sum, p) => sum + p.totalCost, 0);
				const totalProfit = totalRevenue - totalCost;

				// Outstanding Invoices
				const outstandingQuery = db
					.select({ total: sum(invoices.total) })
					.from(invoices)
					.where(
						and(
							sql`${invoices.status} NOT IN ('paid', 'cancelled')`,
							companyId
								? sql`${invoices.clientId} IN (SELECT id FROM ${clients} WHERE ${clients.companyId} = ${companyId})`
								: undefined
						)
					);

				const [outResult] = await outstandingQuery;

				return {
					totalRevenue,
					totalCost,
					totalProfit,
					outstandingRevenue: parseFloat(outResult?.total || '0'),
					averageMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
				};
			},
			this.CACHE_TTL
		);
	}

	/**
	 * Get expense breakdown by category
	 */
	async getExpenseBreakdown(months = 3, companyId?: string) {
		return await cache.getOrSet(
			`dashboard:expense_breakdown:${months}:${companyId || 'global'}`,
			async () => {
				const startDate = new Date();
				startDate.setMonth(startDate.getMonth() - months);

				let query = db
					.select({
						category: expenses.category,
						total: sum(expenses.amount)
					})
					.from(expenses);

				const conditions = [sql`${expenses.date} >= ${startDate.toISOString().split('T')[0]}`];

				if (companyId) {
					query = query
						.innerJoin(projects, eq(expenses.projectId, projects.id))
						.innerJoin(clients, eq(projects.clientId, clients.id)) as unknown as typeof query;
					conditions.push(eq(clients.companyId, companyId));
				}

				const results = await query.where(and(...conditions)).groupBy(expenses.category);

				return results.map((r) => ({
					category: r.category || 'Uncategorized',
					total: parseFloat(r.total || '0')
				}));
			},
			this.CACHE_TTL
		);
	}

	/**
	 * Get team productivity metrics
	 */
	async getTeamProductivity(limit = 10, companyId?: string) {
		return await cache.getOrSet(
			`dashboard:team_productivity:${limit}:${companyId || 'global'}`,
			async () => {
				let query = db
					.select({
						userId: users.id,
						userName: users.name,
						// Assuming 'Done' is the name of the completed column, or use mapped value if available
						// Ideally we should check column position or type, but schema only has name.
						// We'll match common completed names.
						completedTasks: sql<number>`COUNT(CASE WHEN ${projectColumns.name} IN ('Done', 'Completed', 'Selesai') THEN 1 END)`,
						totalTasks: count(tasks.id)
					})
					.from(users)
					.leftJoin(tasks, sql`${tasks.assignedTo} = ${users.id}`)
					.leftJoin(projectColumns, eq(tasks.columnId, projectColumns.id));

				if (companyId) {
					query = query
						.innerJoin(employees, eq(users.id, employees.userId))
						.where(eq(employees.companyId, companyId)) as unknown as typeof query;

					// Also filter tasks? If we just want global productivity of this team member, we might not filter tasks.
					// But usually we want productivity WITHIN THIS COMPANY.
					// Doing that in a single query with left joins is tricky.
					// For now, let's just filter the users who are in the company.
				}

				const results = await query
					.groupBy(users.id, users.name)
					.orderBy(desc(sql`completedTasks`))
					.limit(limit);

				return results.map((r) => ({
					userId: r.userId,
					userName: r.userName,
					completedTasks: Number(r.completedTasks),
					totalTasks: r.totalTasks,
					completionRate:
						r.totalTasks > 0 ? ((Number(r.completedTasks) / r.totalTasks) * 100).toFixed(1) : '0'
				}));
			},
			this.CACHE_TTL
		);
	}

	/**
	 * Get client acquisition trends
	 */
	async getClientAcquisition(months = 6, companyId?: string) {
		return await cache.getOrSet(
			`dashboard:client_acquisition:${months}:${companyId || 'global'}`,
			async () => {
				// Generate month list for filling gaps
				const monthsList = [];
				const today = new Date();
				for (let i = months - 1; i >= 0; i--) {
					const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
					const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
					monthsList.push(monthStr);
				}

				const startDate = new Date();
				startDate.setMonth(startDate.getMonth() - months);
				startDate.setDate(1);

				const query = db
					.select({
						month: sql<string>`to_char(${clients.createdAt}, 'YYYY-MM')`,
						count: count()
					})
					.from(clients);

				const conditions = [gte(clients.createdAt, startDate)];

				if (companyId) {
					conditions.push(eq(clients.companyId, companyId));
				}

				const results = await query
					.where(and(...conditions))
					.groupBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`)
					.orderBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`);

				const resultMap = new Map(results.map((r) => [r.month, r.count]));

				return monthsList.map((month) => ({
					month,
					count: resultMap.get(month) || 0
				}));
			},
			this.CACHE_TTL
		);
	}

	/**
	 * Get invoice aging report (overdue invoices)
	 */
	async getInvoiceAging(companyId?: string) {
		return await cache.getOrSet(
			`dashboard:invoice_aging:${companyId || 'global'}`,
			async () => {
				const now = new Date();
				const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

				let query = db
					.select({
						ageGroup: sql<string>`CASE
							WHEN (${today}::date - ${invoices.dueDate}::date) <= 30 THEN '0-30 days'
							WHEN (${today}::date - ${invoices.dueDate}::date) <= 60 THEN '31-60 days'
							WHEN (${today}::date - ${invoices.dueDate}::date) <= 90 THEN '61-90 days'
							ELSE '90+ days'
						END`,
						count: count(),
						total: sum(invoices.total)
					})
					.from(invoices);

				const conditions = [
					sql`${invoices.status} IN ('sent', 'partially_paid', 'overdue')`,
					sql`${invoices.dueDate} <= ${today}`
				];

				if (companyId) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					query = query.innerJoin(clients, eq(invoices.clientId, clients.id)) as any;
					conditions.push(eq(clients.companyId, companyId));
				}

				const results = await query.where(and(...conditions)).groupBy(sql`ageGroup`);

				return results.map((r) => ({
					ageGroup: r.ageGroup,
					count: r.count,
					total: parseFloat(r.total || '0')
				}));
			},
			this.CACHE_TTL
		);
	}

	/**
	 * Invalidate all dashboard caches
	 */
	async invalidateCache() {
		await cache.delPattern('dashboard:*');
	}
}
