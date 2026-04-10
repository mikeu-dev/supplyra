import { InvoiceController } from '$lib/server/modules/invoice/controller';
import { CompanyModule } from '$lib/server/modules/company/module';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const controller = new InvoiceController();
	const companyService = CompanyModule.getService();

	const [invoice, company] = await Promise.all([
		controller.getWithDetails(params.id),
		locals.activeCompany?.id ? companyService.getById(locals.activeCompany.id) : null
	]);

	if (!invoice) {
		error(404, 'Invoice not found');
	}

	return { invoice, company };
};
