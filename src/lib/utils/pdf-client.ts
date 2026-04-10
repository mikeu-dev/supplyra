import type { Company } from '$lib/server/database/schemas';

export interface PdfInvoice {
	number: string;
	issueDate: string | Date;
	items: Array<{ description: string; quantity: number; unitPrice: number }>;
	total: number;
}

export class PdfClient {
	static async generateInvoice(invoice: PdfInvoice, company: Company | null) {
		const theme = (company?.themeConfig as Record<string, unknown>) || {};
		const primaryColor = (theme.primaryColor as string) || '#0047FF';

		// Dynamic import to avoid heavy building
		const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
			import('pdfmake/build/pdfmake'),
			import('pdfmake/build/vfs_fonts')
		]);

		// Initialize vfs (Virtual File System) for fonts
		// @ts-expect-error - pdfMake types don't include vfs property
		pdfMake.vfs = pdfFonts.pdfMake.vfs;

		const docDefinition = {
			pageSize: 'A4',
			pageMargins: [40, 60, 40, 60],
			content: [
				// HEADER
				{
					columns: [
						{
							stack: [
								{ text: company?.name || 'Supplyra ERP', style: 'companyName' },
								{ text: company?.address || '', style: 'companyDetails' },
								{ text: `Phone: ${company?.phone || ''} | Email: ${company?.email || ''}`, style: 'companyDetails' }
							]
						},
						{
							stack: [
								{ text: 'INVOICE', style: 'mainHeader', alignment: 'right' },
								{ text: `#${invoice.number}`, style: 'invoiceNumber', alignment: 'right' },
								{ text: `Date: ${new Date(invoice.issueDate).toLocaleDateString('id-ID')}`, alignment: 'right', fontSize: 10 }
							]
						}
					]
				},

				{ canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 0.5, lineColor: '#eeeeee' }] },

				// BILL TO
				{
					margin: [0, 30, 0, 30],
					columns: [
						{
							stack: [
								{ text: 'BILL TO:', style: 'sectionLabel' },
								{ text: invoice.number.includes('INV') ? 'Client ID: ' + invoice.number : 'Customer', style: 'clientName' }
							]
						},
						{
							stack: [
								{ text: 'PAYMENT STATUS:', style: 'sectionLabel', alignment: 'right' },
								{ text: 'UNPAID', style: 'statusBadge', alignment: 'right', color: primaryColor }
							]
						}
					]
				},

				// TABLE
				{
					table: {
						headerRows: 1,
						widths: ['*', 'auto', 'auto', 'auto'],
						body: [
							[
								{ text: 'DESCRIPTION', style: 'tableHeader' },
								{ text: 'QTY', style: 'tableHeader', alignment: 'right' },
								{ text: 'UNIT PRICE', style: 'tableHeader', alignment: 'right' },
								{ text: 'TOTAL', style: 'tableHeader', alignment: 'right' }
							],
							...invoice.items.map((item: { description: string; quantity: number; unitPrice: number }) => [
								{ text: item.description, style: 'tableCell' },
								{ text: item.quantity, style: 'tableCell', alignment: 'right' },
								{ text: new Intl.NumberFormat('id-ID').format(item.unitPrice), style: 'tableCell', alignment: 'right' },
								{ text: new Intl.NumberFormat('id-ID').format(item.quantity * item.unitPrice), style: 'tableCell', alignment: 'right' }
							])
						]
					},
					layout: {
						hLineWidth: (i: number, node: { table: { body: unknown[][] } }) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
						vLineWidth: () => 0,
						hLineColor: () => '#eeeeee',
						paddingLeft: () => 8,
						paddingRight: () => 8,
						paddingTop: () => 10,
						paddingBottom: () => 10,
						fillColor: (i: number) => (i === 0 ? primaryColor : null)
					}
				},

				// SUMMARY
				{
					margin: [0, 20, 0, 0],
					columns: [
						{ text: '', width: '*' },
						{
							width: 'auto',
							table: {
								widths: [100, 100],
								body: [
									[
										{ text: 'Subtotal', fontSize: 10, margin: [0, 5] },
										{ text: new Intl.NumberFormat('id-ID').format(invoice.total), alignment: 'right', fontSize: 10, margin: [0, 5] }
									],
									[
										{ text: 'Tax (0%)', fontSize: 10, margin: [0, 5] },
										{ text: '0', alignment: 'right', fontSize: 10, margin: [0, 5] }
									],
									[
										{ text: 'TOTAL DUE', style: 'totalLabel' },
										{ text: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(invoice.total), style: 'totalValue', alignment: 'right' }
									]
								]
							},
							layout: 'noBorders'
						}
					]
				},

				// FOOTER NOTES
				{
					margin: [0, 60, 0, 0],
					stack: [
						{ text: 'NOTES & TERMS', style: 'sectionLabel' },
						{ text: 'Please make payment within 14 days of receiving this invoice. Thank you for your business!', fontSize: 9, color: '#666666', lineHeight: 1.5 }
					]
				}
			],
			styles: {
				companyName: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
				companyDetails: { fontSize: 9, color: '#666666' },
				mainHeader: { fontSize: 24, bold: true, color: primaryColor },
				invoiceNumber: { fontSize: 14, color: '#999999', margin: [0, 0, 0, 5] },
				sectionLabel: { fontSize: 9, bold: true, color: '#999999', margin: [0, 0, 0, 5] },
				clientName: { fontSize: 12, bold: true },
				statusBadge: { fontSize: 12, bold: true },
				tableHeader: { fontSize: 9, bold: true, color: '#ffffff', margin: [0, 5] },
				tableCell: { fontSize: 10, margin: [0, 5] },
				totalLabel: { fontSize: 12, bold: true, margin: [0, 10] },
				totalValue: { fontSize: 14, bold: true, color: primaryColor, margin: [0, 10] }
			}
		};

		// @ts-expect-error - DocDefinition is complex and varies by pdfmake version
		pdfMake.createPdf(docDefinition).download(`Invoice-${invoice.number}.pdf`);
	}
}
