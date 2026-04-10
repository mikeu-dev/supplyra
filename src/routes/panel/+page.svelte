<script lang="ts">
	import type { PageServerData } from './$types';

	import StatsWidget from '$lib/components/dashboard/StatsWidget.svelte';
	import ActivityItem from '$lib/components/dashboard/ActivityItem.svelte';
	import ChartWidget from '$lib/components/dashboard/ChartWidget.svelte';
	import * as Card from '$lib/components/ui/card';
	import Coins from '@lucide/svelte/icons/coins';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import * as m from '$lib/paraglide/messages.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';

	let { data }: { data: PageServerData } = $props();

	function formatCurrency(value: number | string | null) {
		if (value === null || value === undefined) return 'Rp 0';
		const num = typeof value === 'string' ? parseFloat(value) : value;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(num);
	}
</script>

<svelte:head>
	<title>{m.menu_dashboard()}</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Executive Dashboard
		</h1>
		<Badge variant="outline" class="text-xs">Software House Mode</Badge>
	</div>

	<!-- Financial Summary Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<StatsWidget
			title="Total Revenue"
			value={formatCurrency(data.financialSummary.totalRevenue)}
			icon={Coins}
			trend={12.5}
			trendLabel="vs last month"
		/>
		<StatsWidget
			title="Gross Profit"
			value={formatCurrency(data.financialSummary.totalProfit)}
			icon={TrendingUp}
			trend={8.2}
			trendLabel="vs last month"
		/>
		<StatsWidget
			title="Average Margin"
			value={`${data.financialSummary.averageMargin.toFixed(1)}%`}
			icon={BarChart3}
			trend={-2.1}
			trendLabel="vs last month"
		/>
		<StatsWidget
			title="Outstanding Billing"
			value={formatCurrency(data.financialSummary.outstandingRevenue)}
			icon={CreditCard}
			trend={15.4}
			trendLabel="needs attention"
		/>
	</div>

	<div class="grid gap-6 md:grid-cols-3">
		<!-- Revenue Trends Chart -->
		<div class="md:col-span-2">
			<ChartWidget
				title="Revenue Trends (Last 6 Months)"
				type="line"
				labels={data.charts.revenueTrends.map((t) => t.month)}
				data={data.charts.revenueTrends.map((t) => t.revenue)}
			/>
		</div>

		<!-- Project Status (Doughnut) -->
		<div class="md:col-span-1">
			<ChartWidget
				title={m.dashboard_projects_status()}
				type="doughnut"
				labels={data.charts.projectStatus.map((d) => d.status || 'tanpa status')}
				data={data.charts.projectStatus.map((d) => d.count)}
			/>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-3">
		<!-- Project Profitability Table -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Top Project Profitability</Card.Title>
				<Card.Description>Monitoring real-time profit for active projects.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="text-muted-foreground border-b text-[10px] tracking-wider uppercase">
								<th class="py-2">Project Name</th>
								<th class="py-2 text-right">Revenue</th>
								<th class="py-2 text-right">Actual Cost</th>
								<th class="py-2 text-right">Profit</th>
								<th class="py-2 text-right">Margin</th>
							</tr>
						</thead>
						<tbody>
							{#each data.projectProfitability as project (project.projectId)}
								<tr class="hover:bg-muted/50 border-b last:border-0">
									<td class="py-3">
										<a
											href="/panel/project/{project.projectId}"
											class="font-medium hover:underline"
										>
											{project.projectName}
										</a>
									</td>
									<td class="py-3 text-right">{formatCurrency(project.revenue)}</td>
									<td class="text-destructive py-3 text-right">
										{formatCurrency(project.totalCost)}
									</td>
									<td class="py-3 text-right font-bold text-green-600">
										{formatCurrency(project.profit)}
									</td>
									<td class="py-3 text-right">
										<div class="flex items-center justify-end gap-2">
											<span class="text-[10px] font-medium">{project.margin.toFixed(0)}%</span>
											<Progress value={project.margin} class="h-1.5 w-12" />
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Recent Activity -->
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>{m.dashboard_recent_activity()}</Card.Title>
				<Card.Description>Sistem update terbaru.</Card.Description>
			</Card.Header>
			<Card.Content class="p-0">
				{#if data.recentActivities.length > 0}
					<div class="max-h-[500px] overflow-y-auto">
						{#each data.recentActivities as activity (activity.id)}
							<ActivityItem {activity} />
						{/each}
					</div>
				{:else}
					<div class="text-muted-foreground p-4 text-center">{m.dashboard_no_activity()}</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
