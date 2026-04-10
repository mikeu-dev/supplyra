<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { PdfClient } from '$lib/utils/pdf-client';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Download from '@lucide/svelte/icons/download';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData as GeneratedPageData } from './$types';
	import type { Company } from '$lib/server/database/schemas';

	interface InvoiceItem {
		description: string;
		quantity: string | number | null;
		unitPrice: string | number | null;
	}

	interface ExtendedPageData extends GeneratedPageData {
		invoice: GeneratedPageData['invoice'] & {
			client: { name: string } | null;
			items: InvoiceItem[];
		};
		company: Company | null;
	}

	let { data }: { data: ExtendedPageData } = $props();
	const invoice = $derived(data.invoice);
	const company = $derived(data.company);

	function downloadPdf() {
		// Convert strings to numbers for PDF generator
		const formattedInvoice = {
			...invoice,
			items: invoice.items.map((item: InvoiceItem) => ({
				...item,
				description: item.description,
				quantity: Number(item.quantity || 0),
				unitPrice: Number(item.unitPrice || 0)
			})),
			total: Number(invoice.total || 0)
		};
		PdfClient.generateInvoice(formattedInvoice, company);
	}
</script>

<div class="flex flex-col gap-6 p-4 md:p-8">
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" href="/panel/finance/invoices">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			{m.invoice_detail_title({ number: invoice.number })}
		</h1>
		<div class="ml-auto">
			<Button onclick={downloadPdf}>
				<Download class="mr-2 h-4 w-4" />
				{m.action_download_pdf()}
			</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>{m.label_details()}</CardTitle>
			</CardHeader>
			<CardContent class="grid gap-4">
				<div class="grid grid-cols-2">
					<span class="text-muted-foreground text-sm font-medium">{m.tbl_status()}:</span>
					<span class="text-sm font-bold uppercase">{invoice.status}</span>
				</div>
				<div class="grid grid-cols-2">
					<span class="text-muted-foreground text-sm font-medium">{m.tbl_issue_date()}:</span>
					<span class="text-sm">{new Date(invoice.issueDate).toLocaleDateString()}</span>
				</div>
				<div class="grid grid-cols-2">
					<span class="text-muted-foreground text-sm font-medium">{m.tbl_due_date()}:</span>
					<span class="text-sm"
						>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span
					>
				</div>
				<div class="grid grid-cols-2">
					<span class="text-muted-foreground text-sm font-medium">{m.tbl_client()}:</span>
					<span class="text-sm">{invoice.client?.name || 'N/A'}</span>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{m.label_items()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="relative w-full overflow-auto">
					<table class="w-full caption-bottom text-sm">
						<thead class="[&_tr]:border-b">
							<tr
								class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
							>
								<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium"
									>{m.tbl_description()}</th
								>
								<th class="text-muted-foreground h-12 px-4 text-right align-middle font-medium"
									>{m.tbl_qty()}</th
								>
								<th class="text-muted-foreground h-12 px-4 text-right align-middle font-medium"
									>{m.tbl_price()}</th
								>
								<th class="text-muted-foreground h-12 px-4 text-right align-middle font-medium"
									>{m.tbl_total()}</th
								>
							</tr>
						</thead>
						<tbody class="[&_tr:last-child]:border-0">
							{#each invoice.items as item, index (index)}
								<tr
									class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
								>
									<td class="p-4 align-middle">{item.description}</td>
									<td class="p-4 text-right align-middle">{item.quantity}</td>
									<td class="p-4 text-right align-middle">{item.unitPrice}</td>
									<td class="p-4 text-right align-middle">
										{Number(item.quantity || 0) * Number(item.unitPrice || 0)}
									</td>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr class="font-medium">
								<td colspan="3" class="p-4 text-right align-middle">Total</td>
								<td class="p-4 text-right align-middle">{Number(invoice.total || 0)}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
