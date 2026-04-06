<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { Portfolio } from '$lib/assets/json/index.js';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Search from '@lucide/svelte/icons/search';

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let initialLocale = $state(getLocale());
	let portfolioContent = $state(Portfolio.content[initialLocale]);
	$effect(() => {
		if (initialLocale) {
			portfolioContent = Portfolio.content[initialLocale];
		} else {
			portfolioContent = Portfolio.content['en'];
		}
	});

	let currentPage = $state(1);
	const itemsPerPage = 9; // Grid 3x3

	let searchTerm = $state('');
	let selectedCategory = $state('All'); // Single select logic for tabs

	let listProjectEl: HTMLElement | null = null;
	let isMounted = $state(false);
	let isOpenProject = $state(false);

	type ProjectDB = PageData['projects'][number];
	type ClientDB = PageData['clients'][number];

	// Map DB projects to UI format
	let projects = $derived(
		data.projects.map((p: ProjectDB) => ({
			id: p.id,
			clientId: p.clientId,
			clientName: data.clients.find((c: ClientDB) => c.id === p.clientId)?.name || '',
			tag: p.category,
			title: p.name,
			description: p.description,
			thumbnail: p.thumbnail,
			moockup: p.mockup,
			techs: p.techStack ? JSON.stringify(p.techStack) : null
		}))
	);

	// Extract unique categories for filter tabs
	let categories = $derived([
		'All',
		...(Array.from(new Set(projects.map((p: Project) => p.tag).filter(Boolean))) as string[])
	]);

	type Project = (typeof projects)[number];

	// eslint-disable-next-line svelte/prefer-writable-derived
	let filteredProjects = $state<Project[]>([]);
	// eslint-disable-next-line svelte/prefer-writable-derived
	let totalPages = $state(1);

	// Filter Logic
	$effect(() => {
		filteredProjects = projects.filter((project: Project) => {
			const matchesSearch =
				project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(project.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

			const tag = typeof project.tag === 'string' ? project.tag.toLowerCase() : '';
			const matchesCategory = selectedCategory === 'All' || tag === selectedCategory.toLowerCase();

			return matchesSearch && matchesCategory;
		});
	});

	// eslint-disable-next-line svelte/prefer-writable-derived
	let paginatedProjects = $state<Project[]>([]);
	let selectedProject = $state<({ id: string } & Project) | null>(null);

	onMount(() => {
		isMounted = true;
	});

	function scrollToProjects() {
		if (isMounted && listProjectEl) {
			listProjectEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;
		currentPage = 1;
	}

	$effect(() => {
		totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
	});

	$effect(() => {
		paginatedProjects = filteredProjects.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);
	});

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage += 1;
			scrollToProjects();
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage -= 1;
			scrollToProjects();
		}
	}

	function goToPage(value: number) {
		currentPage = value;
		scrollToProjects();
	}
</script>

<div class="bg-white dark:bg-slate-900">
	<!-- HERO SECTION -->
	<section id={Portfolio.id} class="relative isolate overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16">
		<!-- Decoration -->
		<div
			class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
			aria-hidden="true"
		>
			<div
				class="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
				style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
			></div>
		</div>

		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
					{portfolioContent.heading}
				</h1>
				<p class="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
					{portfolioContent.description}
				</p>
			</div>
		</div>
	</section>

	<!-- PORTFOLIO FEED -->
	<section
		id="portfolio-feed"
		class="mx-auto max-w-7xl px-6 pb-24 lg:px-8"
		bind:this={listProjectEl}
	>
		<!-- CONTROLS: Filter & Search -->
		<div
			class="mb-12 flex flex-col items-center justify-between gap-6 border-b border-slate-200 pt-6 pb-6 md:flex-row dark:border-slate-800"
		>
			<!-- Categories / Tabs -->
			<div class="flex flex-wrap items-center gap-2">
				{#each categories as category (category)}
					<Button
						variant={selectedCategory === category ? 'default' : 'ghost'}
						size="sm"
						class="rounded-full px-4"
						onclick={() => (selectedCategory = category)}
					>
						{category}
					</Button>
				{/each}
			</div>

			<!-- Search -->
			<div
				class="ring-offset-background focus-within:ring-ring relative w-full max-w-xs rounded-md focus-within:ring-2 focus-within:ring-offset-2"
			>
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<input
					type="search"
					placeholder={portfolioContent.form.placeholder}
					oninput={handleSearch}
					class="border-input bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>
		</div>

		<!-- GRID -->
		{#if filteredProjects.length > 0}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each paginatedProjects as item (item.id)}
					<button
						type="button"
						class="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-50 text-left transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800"
						onclick={() => {
							selectedProject = item;
							isOpenProject = true;
						}}
					>
						<div
							class="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-700"
						>
							{#if item.thumbnail}
								<img
									src={item.thumbnail}
									alt={item.title}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
								/>
							{:else}
								<Skeleton class="h-full w-full" />
							{/if}
							<!-- Overlay gradient on hover -->
							<div
								class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							></div>
						</div>
						<div class="flex flex-1 flex-col p-6">
							<div class="mb-3 flex items-center justify-between">
								<Badge variant="secondary" class="rounded-md px-2.5 py-0.5 font-medium">
									{item.tag}
								</Badge>
							</div>
							<h3
								class="mb-2 text-xl font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
							>
								{item.title}
							</h3>
							<p class="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
								{item.description ?? ''}
							</p>
							<div
								class="mt-auto flex items-center text-sm font-medium text-blue-600 dark:text-blue-400"
							>
								View Details
								<ArrowRight class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- PAGINATION -->
			<div class="mt-12 flex justify-center">
				<Pagination.Root count={filteredProjects.length} perPage={itemsPerPage}>
					{#snippet children({ pages, currentPage })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton onclick={prevPage} />
							</Pagination.Item>
							{#each pages as page (page.key)}
								{#if page.type === 'ellipsis'}
									<Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link
											{page}
											isActive={currentPage === page.value}
											onclick={() => goToPage(page.value)}
										>
											{page.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton onclick={nextPage} />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</div>
		{:else}
			<div class="flex min-h-[400px] flex-col items-center justify-center text-center">
				<div class="rounded-full bg-slate-100 p-6 dark:bg-slate-800">
					<Search class="h-10 w-10 text-slate-400" />
				</div>
				<h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No projects found</h3>
				<p class="mt-2 text-slate-500 dark:text-slate-400">
					{portfolioContent.notFound}
				</p>
				<Button variant="outline" class="mt-6" onclick={() => (searchTerm = '')}>
					Clear Search
				</Button>
			</div>
		{/if}
	</section>

	<!-- CTA SECTION -->
	{#if portfolioContent.cta}
		<section class="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-32">
			<!-- Background effects -->
			<div
				class="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
				aria-hidden="true"
			>
				<div
					class="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
					style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
				></div>
			</div>

			<div class="mx-auto max-w-7xl px-6 text-center lg:px-8">
				<div class="mx-auto max-w-2xl">
					<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
						{portfolioContent.cta.heading}
					</h2>
					<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
						{portfolioContent.cta.subheading}
					</p>
					<div class="mt-10 flex items-center justify-center gap-x-6">
						<Button size="lg" variant="default" href="mailto:support@supplyra.com">
							Hubungi Kami
						</Button>
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>

<!-- PROJECT DETAIL DIALOG -->
<Dialog.Root bind:open={isOpenProject}>
	<Dialog.Content class="overflow-hidden p-0 sm:max-w-6xl sm:rounded-2xl">
		<div class="flex h-[80vh] flex-col md:h-[600px] md:flex-row">
			<!-- DIALOG IMAGE -->
			<div class="group relative bg-black/5 md:w-3/5">
				{#if selectedProject?.moockup ?? selectedProject?.thumbnail}
					<img
						src={selectedProject?.moockup ?? selectedProject?.thumbnail}
						alt={selectedProject?.title}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div class="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800">
						<Skeleton class="h-24 w-24 rounded-xl" />
					</div>
				{/if}
			</div>

			<!-- DIALOG INFO -->
			<div class="flex flex-col overflow-y-auto bg-white p-6 md:w-2/5 md:p-8 dark:bg-slate-900">
				<div class="mb-6">
					<Badge class="mb-3">{selectedProject?.tag}</Badge>
					<h2 class="text-2xl font-bold text-slate-900 dark:text-white">
						{selectedProject?.title}
					</h2>
					<p class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
						Client: {selectedProject?.clientName}
					</p>
				</div>

				<div class="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300">
					<p>
						{selectedProject?.description ??
							'Deskripsi proyek belum tersedia. Silakan hubungi kami untuk informasi lebih lanjut.'}
					</p>
				</div>

				<Separator class="my-6" />

				<div class="space-y-4">
					<div>
						<h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Technologies</h4>
						<div class="flex flex-wrap gap-2">
							{#if selectedProject?.techs}
								<!-- Parse if string, otherwise existing array logic -->
								<div class="text-sm text-slate-600 dark:text-slate-400">
									{selectedProject.techs}
								</div>
							{:else}
								<span class="text-sm text-slate-400">-</span>
							{/if}
						</div>
					</div>
				</div>

				<div class="mt-auto pt-6">
					<Button class="w-full" variant="outline" onclick={() => (isOpenProject = false)}>
						{portfolioContent.modal.close}
					</Button>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
