<script lang="ts">
	import type { PageData } from './$types';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { format } from 'date-fns';
	import Eye from '@lucide/svelte/icons/eye';
	import Filter from '@lucide/svelte/icons/filter';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	interface AuditLog {
		id: string;
		action: string;
		entityType: string;
		entityId: string | null;
		oldValue: string | null;
		newValue: string | null;
		ipAddress: string | null;
		userAgent: string | null;
		createdAt: Date;
		user: {
			id: string;
			name: string;
			email: string;
		} | null;
	}

	let { data }: { data: PageData } = $props();

	let selectedLog = $state<AuditLog | null>(null);
	let isDialogOpen = $state(false);

	function openLogDetails(log: AuditLog) {
		selectedLog = log;
		isDialogOpen = true;
	}

	function handleFilter(name: string, value: string) {
		const url = new URL(page.url);
		if (value) {
			url.searchParams.set(name, value);
		} else {
			url.searchParams.delete(name);
		}
		url.searchParams.set('page', '1');
		goto(url.toString(), { keepFocus: true });
	}

	const getActionColor = (action: string) => {
		switch (action) {
			case 'create':
				return 'bg-green-500/10 text-green-600 border-green-200';
			case 'update':
				return 'bg-blue-500/10 text-blue-600 border-blue-200';
			case 'delete':
				return 'bg-red-500/10 text-red-600 border-red-200';
			case 'login':
				return 'bg-purple-500/10 text-purple-600 border-purple-200';
			default:
				return 'bg-gray-500/10 text-gray-600 border-gray-200';
		}
	};
</script>

<svelte:head>
	<title>Audit Trail Explorer | Supplyra</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-6 p-6">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Audit Trail Explorer
		</h1>
		<p class="text-muted-foreground">
			Monitor and track all database changes and user activities for compliance and debugging.
		</p>
	</div>

	<Separator />

	<!-- Filter Bar -->
	<Card.Root>
		<Card.Content class="pt-6">
			<div class="flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-2">
					<Filter class="text-muted-foreground h-4 w-4" />
					<span class="text-sm font-medium">Filters:</span>
				</div>
				
				<div class="flex-1 min-w-[200px]">
					<select 
						class="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
						onchange={(e) => handleFilter('action', (e.target as HTMLSelectElement).value)}
					>
						<option value="">All Actions</option>
						<option value="create">Create</option>
						<option value="update">Update</option>
						<option value="delete">Delete</option>
						<option value="login">Login</option>
						<option value="logout">Logout</option>
					</select>
				</div>

				<div class="flex-1 min-w-[200px]">
					<select 
						class="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
						onchange={(e) => handleFilter('entityType', (e.target as HTMLSelectElement).value)}
					>
						<option value="">All Entities</option>
						{#each data.filters.entityTypes as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>

				<div class="flex-1 min-w-[200px]">
					<Input 
						placeholder="Search User ID..." 
						class="h-9"
						onchange={(e) => handleFilter('userId', (e.target as HTMLInputElement).value)}
					/>
				</div>

				<Button variant="outline" size="sm" onclick={() => goto(page.url.pathname)}>
					Reset
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Data Table -->
	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Timestamp</Table.Head>
						<Table.Head>User</Table.Head>
						<Table.Head>Action</Table.Head>
						<Table.Head>Entity</Table.Head>
						<Table.Head>Entity ID</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.auditLogs.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="h-24 text-center">
								No audit logs found.
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.auditLogs as log (log.id)}
							<Table.Row>
								<Table.Cell class="font-mono text-xs">
									{format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col">
										<span class="font-medium text-sm">{log.user?.name || 'System'}</span>
										<span class="text-[10px] text-muted-foreground">{log.user?.email || 'N/A'}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline" class={getActionColor(log.action)}>
										{log.action}
									</Badge>
								</Table.Cell>
								<Table.Cell class="capitalize">{log.entityType}</Table.Cell>
								<Table.Cell class="font-mono text-[10px] opacity-70">
									{log.entityId || '-'}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button variant="ghost" size="icon" onclick={() => openLogDetails(log)}>
										<Eye class="h-4 w-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
		<Card.Footer class="flex items-center justify-between border-t px-6 py-4">
			<div class="text-muted-foreground text-xs">
				Showing {data.auditLogs.length} of {data.total} logs
			</div>
			<div class="flex items-center gap-2">
				<Button 
					variant="outline" 
					size="sm" 
					disabled={data.pagination.page === 1}
					onclick={() => handleFilter('page', (data.pagination.page - 1).toString())}
				>
					Previous
				</Button>
				<div class="text-xs font-medium">Page {data.pagination.page} of {data.pagination.totalPages}</div>
				<Button 
					variant="outline" 
					size="sm" 
					disabled={data.pagination.page === data.pagination.totalPages}
					onclick={() => handleFilter('page', (data.pagination.page + 1).toString())}
				>
					Next
				</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>

<!-- Details Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Audit Log Details</Dialog.Title>
			<Dialog.Description>
				Viewing change data for {selectedLog?.entityType} (ID: {selectedLog?.entityId})
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedLog}
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2 text-sm">
						<div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Original Values</div>
						<div class="rounded-md border bg-muted p-3 font-mono text-[11px] overflow-auto h-[300px]">
							{#if selectedLog.oldValue}
								<pre>{JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2)}</pre>
							{:else}
								<span class="text-muted-foreground italic">No original data (Creation)</span>
							{/if}
						</div>
					</div>
					<div class="space-y-2 text-sm">
						<div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Values</div>
						<div class="rounded-md border bg-muted p-3 font-mono text-[11px] overflow-auto h-[300px]">
							{#if selectedLog.newValue}
								<pre>{JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)}</pre>
							{:else}
								<span class="text-muted-foreground italic">No new data (Deletion)</span>
							{/if}
						</div>
					</div>
				</div>

				<Separator />

				<div class="grid grid-cols-2 gap-4 text-xs">
					<div>
						<span class="text-muted-foreground block text-[10px] font-bold uppercase">IP Address</span>
						<span class="font-medium">{selectedLog.ipAddress || 'Unknown'}</span>
					</div>
					<div>
						<span class="text-muted-foreground block text-[10px] font-bold uppercase">User Agent</span>
						<span class="font-medium truncate block max-w-[300px]" title={selectedLog.userAgent}>
							{selectedLog.userAgent || 'Unknown'}
						</span>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button onclick={() => isDialogOpen = false}>Tutup</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
