<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import Bell from '@lucide/svelte/icons/bell';
	import Search from '@lucide/svelte/icons/search';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { title = 'Supplyra' }: { title?: string } = $props();
</script>

<header
	class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden dark:border-slate-800 dark:bg-slate-950"
>
	<div class="flex items-center gap-3">
		<Sidebar.Trigger class="text-slate-600 dark:text-slate-400">
			<Menu class="h-6 w-6" />
		</Sidebar.Trigger>
		<h1 class="max-w-[150px] truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
			{title}
		</h1>
	</div>

	<div class="flex items-center gap-2">
		<button
			class="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
		>
			<Search class="h-5 w-5" />
		</button>
		<button
			class="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
		>
			<Bell class="h-5 w-5" />
			<span
				class="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950"
			></span>
		</button>
	</div>
</header>
