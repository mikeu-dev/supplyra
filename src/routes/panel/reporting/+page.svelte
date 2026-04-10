<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import Download from '@lucide/svelte/icons/download';
	import StatsWidget from '$lib/components/dashboard/StatsWidget.svelte';
	import ChartWidget from '$lib/components/dashboard/ChartWidget.svelte';
	import Coins from '@lucide/svelte/icons/coins';
	import Activity from '@lucide/svelte/icons/activity';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TrendingUp from '@lucide/svelte/icons/trending-up';

	import type { PageData as GeneratedPageData } from './$types';

	interface FinancialTrend {
		month: string;
		income: number;
		expense: number;
		profit: number;
	}

	interface ExtendedPageData extends GeneratedPageData {
		financialReport: {
			income: number;
			expense: number;
			profit: number;
			period: { startDate: string | undefined; endDate: string | undefined };
		};
		monthlyTrends: FinancialTrend[];
		profitGrowth: number;
		payrollSummary: { totalCost: number; employeeCount: number; paidCount: number };
		attendanceSummary: { totalPresences: number; totalLateMinutes: number; totalPiece: number };
		projectProfitability: Array<{ id: string; name: string; clientName: string | null; income: number; expense: number; profit: number; margin: number }>;
	}

	let { data }: { data: ExtendedPageData } = $props();

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
	}
</script>

<div class="flex flex-1 flex-col gap-6 p-6">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Financial Intelligence
		</h1>
		<p class="text-muted-foreground">Comprehensive insights into business performance and operational efficiency.</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<StatsWidget
			title="Total Revenue"
			value={formatCurrency(data.financialReport.income)}
			icon={Coins}
			trend={15.2}
			trendLabel="annual growth"
		/>
		<StatsWidget
			title="Net Profit"
			value={formatCurrency(data.financialReport.profit)}
			icon={TrendingUp}
			trend={data.profitGrowth}
			trendLabel="vs last month"
		/>
		<StatsWidget
			title="Payroll Cost"
			value={formatCurrency(data.payrollSummary.totalCost)}
			icon={UsersIcon}
			trend={2.4}
			trendLabel="new hires"
		/>
		<StatsWidget
			title="Activity Score"
			value={data.attendanceSummary.totalPresences}
			icon={Activity}
			trend={98}
			trendLabel="system health"
		/>
	</div>

	<div class="grid gap-6 md:grid-cols-3">
		<!-- Main Trend Chart -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Revenue vs Expense Trends</Card.Title>
				<Card.Description>Monitoring financial balance across the last 6 months.</Card.Description>
			</Card.Header>
			<Card.Content>
				<ChartWidget
					title="Monthly Performance"
					type="line"
					labels={data.monthlyTrends.map((t: FinancialTrend) => t.month)}
					data={data.monthlyTrends.map((t: FinancialTrend) => t.income)}
				/>
			</Card.Content>
		</Card.Root>

		<!-- Operational Links -->
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>Export Center</Card.Title>
				<Card.Description>Download raw data for manual processing.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<Button variant="outline" class="w-full justify-between" href="/panel/reporting/download?type=financial" target="_blank">
					<span>Financial Summary (Excel)</span>
					<Download class="h-4 w-4" />
				</Button>
				<Button variant="outline" class="w-full justify-between" href="/panel/reporting/download?type=project" target="_blank">
					<span>Project Data (Excel)</span>
					<Download class="h-4 w-4" />
				</Button>
				<Button variant="outline" class="w-full justify-between" href="/panel/reporting/download?type=payroll" target="_blank">
					<span>Payroll Batch (Excel)</span>
					<Download class="h-4 w-4" />
				</Button>
				<Button variant="outline" class="w-full justify-between" href="/panel/reporting/download?type=attendance" target="_blank">
					<span>Full Attendance (Excel)</span>
					<Download class="h-4 w-4" />
				</Button>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Profitability Analysis -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Project Profitability Matrix</Card.Title>
			<Card.Description>Deep dive into project margins and efficiency.</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Project Name</Table.Head>
						<Table.Head>Client</Table.Head>
						<Table.Head class="text-right">Income</Table.Head>
						<Table.Head class="text-right">Expense</Table.Head>
						<Table.Head class="text-right">Profit</Table.Head>
						<Table.Head class="text-right">Margin</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.projectProfitability as p (p.id)}
						<Table.Row>
							<Table.Cell class="font-semibold">{p.name}</Table.Cell>
							<Table.Cell>{p.clientName || 'General'}</Table.Cell>
							<Table.Cell class="text-right">{formatCurrency(p.income)}</Table.Cell>
							<Table.Cell class="text-right text-red-500">{formatCurrency(p.expense)}</Table.Cell>
							<Table.Cell class="text-right font-bold text-emerald-600">{formatCurrency(p.profit)}</Table.Cell>
							<Table.Cell class="text-right">
								<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border {Number(p.margin) >= 20 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
									{Number(p.margin).toFixed(1)}%
								</span>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
