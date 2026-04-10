<script lang="ts">
	import { NAVIGATION_ITEMS } from '$lib/config/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';
	import Search from '@lucide/svelte/icons/search';
	import CommandIcon from '@lucide/svelte/icons/command';

	let isOpen = $state(false);
	let searchTerm = $state('');
	let selectedIndex = $state(0);

	// Flatten navigation items for searching
	const allItems = NAVIGATION_ITEMS.flatMap((section) =>
		section.menus.map((menu) => ({
			...menu,
			sectionLabel: section.label
		}))
	);

	let filteredItems = $derived(
		searchTerm
			? allItems.filter(
					(item) =>
						item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						item.sectionLabel.toLowerCase().includes(searchTerm.toLowerCase())
				)
			: allItems
	);

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			isOpen = !isOpen;
		}

		if (!isOpen) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % filteredItems.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredItems[selectedIndex]) {
				navigate(filteredItems[selectedIndex].url);
			}
		} else if (e.key === 'Escape') {
			isOpen = false;
		}
	}

	function navigate(url: string) {
		goto(localizeHref(url));
		isOpen = false;
		searchTerm = '';
		selectedIndex = 0;
	}

	$effect(() => {
		if (isOpen) {
			selectedIndex = 0;
		}
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
		<div class="relative flex items-center border-b px-3">
			<Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
			<input
				bind:value={searchTerm}
				placeholder="Ketik untuk mencari menu atau data..."
				class="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
			/>
			<div class="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100">
				<span class="text-xs">ESC</span>
			</div>
		</div>
		<div class="max-h-[300px] overflow-y-auto p-2">
			{#if filteredItems.length === 0}
				<div class="py-6 text-center text-sm text-muted-foreground">
					Tidak ada hasil ditemukan.
				</div>
			{:else}
				<div class="space-y-1">
					{#each filteredItems as item, i (item.url)}
						<button
							class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                                {i === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
							onclick={() => navigate(item.url)}
						>
							<item.icon class="h-4 w-4" />
							<div class="flex flex-col items-start">
								<span class="font-medium">{item.title}</span>
								<span class="text-[10px] opacity-70">{item.sectionLabel}</span>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<div class="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-[10px] text-muted-foreground">
			<div class="flex items-center gap-3">
				<span class="flex items-center gap-1">
					<kbd class="rounded bg-background px-1 border border-b-2">↵</kbd> untuk memilih
				</span>
				<span class="flex items-center gap-1">
					<kbd class="rounded bg-background px-1 border border-b-2">↓↑</kbd> navigasi
				</span>
			</div>
			<div class="flex items-center gap-1">
				<CommandIcon class="h-3 w-3" />
				<span>Supplyra Command Center</span>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	input {
		border: none;
		box-shadow: none;
	}
</style>
