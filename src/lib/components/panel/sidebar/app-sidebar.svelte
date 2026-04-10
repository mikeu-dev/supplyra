<script lang="ts">
	import CompanySwitcher from './company-switcher.svelte';
	import TeamSwitcher from './team/team-switcher.svelte';
	import NavMain from '../navigations/nav-main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import NavUser from '../navigations/nav-user.svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { NAVIGATION_ITEMS, MODULES, type MenuItem } from '$lib/config/navigation';

	type CompanySnippet = { id: string; name: string; logo?: string | null };

	type Props = ComponentProps<typeof Sidebar.Root> & {
		data: {
			user: { name: string; email: string; avatar: string; id: string };
			projects: unknown[];
			availableCompanies: CompanySnippet[];
			activeCompany: CompanySnippet | null;
			permissions?: string[];
		};
	};

	let { data, ref = $bindable(null), collapsible = 'icon', ...restProps }: Props = $props();

	let initialLocale = $state(getLocale());
	let activeModule = $state('all');

	// This is sample data.
	let items = $derived({
		navMain: NAVIGATION_ITEMS.map((section) => ({
			...section,
			menus: section.menus.map((menu) => ({
				...menu,
				url: localizeHref(menu.url.replace(':lang', initialLocale))
			}))
		}))
	});

	const isActiveUrl = (path: string, base: string) =>
		path === base ||
		(path.startsWith(base) && (path.length === base.length || path[base.length] === '/'));

	let navItems = $derived.by(() => {
		const path = page.url.pathname;
		return items.navMain
			.map((group) => {
				const filteredMenus = group.menus.filter((menu) => {
					const hasGroup = (menu as unknown as { groups: string[] }).groups.includes(activeModule);

					const reqPerms = (menu as MenuItem).permissions;
					let hasPerms = true;
					if (reqPerms && reqPerms.length > 0) {
						hasPerms = reqPerms.some((req) => data.permissions?.includes(req));
					}

					return hasGroup && hasPerms;
				});
				if (filteredMenus.length === 0) return null;

				return {
					...group,
					menus: filteredMenus.map((menu) => ({
						...menu,
						isActive: (menu as unknown as { exact?: boolean }).exact
							? path === menu.url
							: isActiveUrl(path, menu.url)
					}))
				};
			})
			.filter(Boolean) as typeof items.navMain;
	});
</script>


<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<CompanySwitcher companies={data.availableCompanies ?? []} activeCompany={data.activeCompany} />
		<TeamSwitcher modules={MODULES} bind:activeModule />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navItems} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser
			user={{
				name: data.user.name ?? '',
				email: data.user.email ?? '',
				avatar: data.user.avatar ?? '',
				id: data.user.id ?? ''
			}}
		/>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
