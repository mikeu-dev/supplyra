<script lang="ts">
	import { onMount } from 'svelte';
	import { getLocale, setLocale, localizeHref } from '$lib/paraglide/runtime';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import Button from '../../ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Id from 'svelte-flags/Id.svelte';
	import GbNir from 'svelte-flags/GbNir.svelte';
	let { data, navbarMenu } = $props();

	// Set initial locale based
	let initialLocale = $state(getLocale());
	$effect(() => {
		if (initialLocale) {
			setLocale(initialLocale);
		}
	});

	// Scroll Behavior
	let lastScrollTop = 0;
	let hideHeader = $state(false);
	let isMenuOpen = $state(false);
	let scrollTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		const handleScroll = () => {
			const currentScroll = window.scrollY;

			if (currentScroll > lastScrollTop && currentScroll > 50) {
				hideHeader = true;
			} else {
				hideHeader = false;
			}
			lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				hideHeader = false;
			}, 150);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header
	class="fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-in-out"
	class:translate-y-[-100%]={hideHeader}
>
	<nav
		class="mx-2 flex items-center justify-between rounded-b-4xl bg-white/30 p-6 shadow backdrop-blur-md lg:px-8 dark:bg-gray-900/30 dark:shadow-sm dark:shadow-gray-600"
		aria-label="Global"
	>
		<!-- Kiri: Logo -->
		<div class="flex-1">
			<a href={localizeHref('/')} class="flex items-center gap-2">
				<img src="/logo.png" alt={data.app_name} class="h-8 w-auto" />
				<span class="sr-only">{data.app_name}</span>
			</a>
		</div>

		<!-- Tengah: Menu (Desktop) -->
		<div
			class="hidden flex-1 justify-center gap-6 text-sm font-semibold text-blue-900 lg:flex dark:text-white"
		>
			{#each navbarMenu as item (item.href)}
				<a
					href={localizeHref(item.href)}
					target={item.target ?? null}
					class="group relative inline-block"
					>{item.label}
					<span
						class="absolute -bottom-1 left-1/2 h-0.5 w-0 origin-center -translate-x-1/2 transform bg-sky-500 transition-all duration-300 group-hover:w-full"
					></span>
				</a>
			{/each}
		</div>

		<!-- Kanan: Toggle dan Mobile Menu Button -->
		<div class="flex flex-1 items-center justify-end gap-2">
			<!-- Theme Toggle (Desktop) -->
			<div class="hidden items-center gap-2 lg:flex">
				<Select.Root type="single" bind:value={initialLocale}>
					<Select.Trigger class="w-[90px] font-mono text-xs" size="sm"
						>{#if initialLocale === 'id'}
							<Id class="h-5 w-5" />ID
						{:else if initialLocale === 'en'}
							<GbNir class="h-5 w-5 text-xs" />EN
						{:else}
							<span class="text-gray-500">Bahasa</span>
						{/if}
					</Select.Trigger>
					<Select.Content class="font-mono text-xs">
						<Select.Item value="id"><Id />ID</Select.Item>
						<Select.Item value="en"><GbNir />EN</Select.Item>
					</Select.Content>
				</Select.Root>
				<Button onclick={toggleMode} variant="outline" size="sm">
					<Sun class="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon
						class="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>

			<!-- Mobile Menu Button -->
			<div class="lg:hidden">
				<button
					class="rounded p-2 text-gray-700 dark:text-white"
					onclick={() => (isMenuOpen = true)}
					aria-label="Open menu"
				>
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
						/>
					</svg>
				</button>
			</div>
		</div>
	</nav>

	<!-- Mobile Menu Overlay -->
	{#if isMenuOpen}
		<div
			class="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm transition-opacity"
			aria-hidden="true"
			onclick={() => (isMenuOpen = false)}
		></div>
		<div
			class="fixed inset-y-0 right-0 z-100 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl dark:bg-gray-900"
		>
			<div class="flex items-center justify-between">
				<a
					href={localizeHref('/')}
					class="flex items-center gap-2"
					onclick={() => (isMenuOpen = false)}
				>
					<img src="/logo.png" alt={data.app_name} class="h-8 w-auto" />
				</a>
				<button
					type="button"
					class="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
					onclick={() => (isMenuOpen = false)}
				>
					<span class="sr-only">Close menu</span>
					<svg
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="mt-6 flow-root">
				<div class="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/20">
					<div class="space-y-2 py-6">
						{#each navbarMenu as item (item.href)}
							<a
								href={localizeHref(item.href)}
								target={item.target ?? null}
								class="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
								onclick={() => (isMenuOpen = false)}
							>
								{item.label}
							</a>
						{/each}
					</div>
					<div class="flex items-center gap-4 py-6">
						<Select.Root type="single" bind:value={initialLocale}>
							<Select.Trigger class="w-[90px] font-mono text-xs" size="sm"
								>{#if initialLocale === 'id'}
									<Id class="h-5 w-5" />ID
								{:else if initialLocale === 'en'}
									<GbNir class="h-5 w-5 text-xs" />EN
								{:else}
									<span class="text-gray-500">Bahasa</span>
								{/if}
							</Select.Trigger>
							<Select.Content class="font-mono text-xs">
								<Select.Item value="id"><Id />ID</Select.Item>
								<Select.Item value="en"><GbNir />EN</Select.Item>
							</Select.Content>
						</Select.Root>
						<Button onclick={toggleMode} variant="outline" size="sm">
							<Sun class="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
							<Moon
								class="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</header>
