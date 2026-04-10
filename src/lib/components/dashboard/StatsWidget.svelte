<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Component } from 'svelte';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import TrendingDown from '@lucide/svelte/icons/trending-down';

	let {
		title,
		value,
		icon: Icon,
		trend = null,
		trendLabel = ''
	}: { 
		title: string; 
		value: string | number; 
		icon: Component;
		trend?: number | null;
		trendLabel?: string;
	} = $props();
</script>

<Card.Root class="relative overflow-hidden group">
	<div class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</Card.Title>
		<div class="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
			<Icon class="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
		</div>
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-black tracking-tight">{value}</div>
		{#if trend !== null}
			<div class="flex items-center gap-1 mt-1">
				{#if trend >= 0}
					<div class="flex items-center text-emerald-600 text-[10px] font-bold">
						<TrendingUp class="h-3 w-3 mr-0.5" />
						+{trend}%
					</div>
				{:else}
					<div class="flex items-center text-rose-600 text-[10px] font-bold">
						<TrendingDown class="h-3 w-3 mr-0.5" />
						{trend}%
					</div>
				{/if}
				<span class="text-[10px] text-muted-foreground font-medium">{trendLabel}</span>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
