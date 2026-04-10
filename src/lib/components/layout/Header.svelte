<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import NotificationDropdown from './NotificationDropdown.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { page } from '$app/state';

	// Interactive breadcrumbs derivation
	let breadcrumbItems = $derived.by(() => {
		const paths = page.url.pathname.split('/').filter(Boolean);
		return paths.map((path, index) => {
			const href = '/' + paths.slice(0, index + 1).join('/');
			return {
				name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
				href
			};
		});
	});
</script>

<header class="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
	<div class="flex items-center gap-2">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mr-2 h-4" />
		
		<Breadcrumb.Root>
			<Breadcrumb.List>
				{#each breadcrumbItems as item, i (i)}
					<Breadcrumb.Item>
						{#if i === breadcrumbItems.length - 1}
							<Breadcrumb.Page class="font-bold text-blue-900 dark:text-blue-100">
								{item.name}
							</Breadcrumb.Page>
						{:else}
							<Breadcrumb.Link href={item.href} class="hover:text-primary transition-colors">
								{item.name}
							</Breadcrumb.Link>
						{/if}
					</Breadcrumb.Item>
					{#if i < breadcrumbItems.length - 1}
						<Breadcrumb.Separator />
					{/if}
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
	<div class="flex items-center gap-4">
		<button
			class="hover:bg-muted hidden items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors md:flex"
			onclick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
		>
			<div class="flex items-center gap-2 opacity-50">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-search"
				><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
				<span>Cari menu...</span>
			</div>
			<kbd
				class="bg-muted pointer-events-none flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100"
			>
				<span class="text-xs">Ctrl+K</span>
			</kbd>
		</button>
		<NotificationDropdown />
	</div>
</header>
