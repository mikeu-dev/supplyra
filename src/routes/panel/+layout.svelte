<script lang="ts">
	import '../../app.css';
	import 'filepond/dist/filepond.css';
	import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/panel/sidebar/app-sidebar.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { LayoutProps } from './$types';
	import { ModeWatcher } from 'mode-watcher';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import OfflineIndicator from '$lib/components/pwa/OfflineIndicator.svelte';
	import MobileNav from '$lib/components/mobile/MobileNav.svelte';
	import MobileHeader from '$lib/components/mobile/MobileHeader.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { realtime } from '$lib/stores/realtime.svelte';
	import CommandPalette from '$lib/components/panel/command-palette.svelte';

	let isLoading = $state(false);

	onMount(() => {
		realtime.connect();

		const unsubTask = realtime.on(
			'task_updated',
			(data: { taskTitle: string; newStatus: string; updatedBy: string }) => {
				const { taskTitle, newStatus, updatedBy } = data;
				toast.info(`Task "${taskTitle}" moved to ${newStatus} by ${updatedBy}`);
				invalidateAll();
			}
		);

		beforeNavigate(() => {
			isLoading = true;
		});

		afterNavigate(() => {
			isLoading = false;
		});

		return () => {
			realtime.disconnect();
			unsubTask();
		};
	});

	let { data, children }: LayoutProps = $props();

	const themeStyle = $derived(
		data.activeCompany?.themeConfig && typeof data.activeCompany.themeConfig === 'object'
			? Object.entries(data.activeCompany.themeConfig)
					.map(([k, v]) => `--${k}: ${v}`)
					.join(';')
			: ''
	);
</script>

<svelte:head>
	{#if themeStyle}
		<!-- prettier-ignore -->
		<style>
			:root {
				{@html themeStyle}
			}
		</style>
	{/if}
</svelte:head>

<ModeWatcher />
<Toaster position="top-center" />
<Sidebar.Provider>
	<AppSidebar {data} />
	<Sidebar.Inset>
		<div class="hidden md:block">
			<Header />
		</div>
		<MobileHeader />
		<div class="flex-1 pb-16 md:pb-0">
			{#if children}
				{@render children?.()}
			{:else}
				<div class="text-center text-gray-500">No content available</div>
			{/if}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

{#if isLoading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm">
		<LoaderCircle class="h-8 w-auto animate-spin text-blue-500" />
	</div>
{/if}

<CommandPalette />
<MobileNav />
<InstallPrompt />
<OfflineIndicator />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
