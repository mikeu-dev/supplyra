<script lang="ts">
	import { pwa } from '$lib/stores/pwa.svelte';
	import Download from '@lucide/svelte/icons/download';
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';

	let showPrompt = $state(false);
	let isInstalling = $state(false);

	onMount(() => {
		// Show prompt after 30 seconds if installable and not installed
		setTimeout(() => {
			if (pwa.isInstallable && !pwa.isInstalled) {
				showPrompt = true;
			}
		}, 30000);
	});

	async function handleInstall() {
		if (!pwa.deferredPrompt) return;

		isInstalling = true;

		try {
			await pwa.deferredPrompt.prompt();
			const choiceResult = await pwa.deferredPrompt.userChoice;

			if (choiceResult.outcome === 'accepted') {
				console.log('User accepted the install prompt');
			} else {
				console.log('User dismissed the install prompt');
			}
		} catch (error) {
			console.error('Error installing PWA:', error);
		} finally {
			isInstalling = false;
			showPrompt = false;
			pwa.setDeferredPrompt(null);
		}
	}

	function handleDismiss() {
		showPrompt = false;
		// Don't show again for this session
		sessionStorage.setItem('pwa-prompt-dismissed', 'true');
	}
</script>

{#if showPrompt && pwa.isInstallable && !pwa.isInstalled}
	<div class="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-96">
		<div
			class="rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
		>
			<div class="flex items-start gap-3">
				<div class="shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
					<Download class="h-5 w-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div class="flex-1">
					<h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
						Install Supplyra App
					</h3>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Install our app for a better experience with offline access and quick launch.
					</p>
					<div class="mt-3 flex gap-2">
						<button
							onclick={handleInstall}
							disabled={isInstalling}
							class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
						>
							{isInstalling ? 'Installing...' : 'Install'}
						</button>
						<button
							onclick={handleDismiss}
							class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							Not Now
						</button>
					</div>
				</div>
				<button
					onclick={handleDismiss}
					class="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		</div>
	</div>
{/if}
