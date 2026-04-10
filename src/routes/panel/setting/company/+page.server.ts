import type { PageServerLoad, Actions } from './$types';
import { CompanyModule } from '$lib/server/modules/company/module';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const companyId = locals.activeCompany?.id;
	if (!companyId) return { company: null };

	const companyService = CompanyModule.getService();
	// Re-fetch to get latest config
	const company = await companyService.getById(companyId);

	return { company };
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const companyId = locals.activeCompany?.id;
		if (!companyId) return fail(401, { error: 'No active company' });

		const formData = await request.formData();
		const address = formData.get('address') as string;
		const phone = formData.get('phone') as string;
		const email = formData.get('email') as string;
		const website = formData.get('website') as string;
		const isPublic = formData.get('isPublic') === 'on';
		const slug = formData.get('slug') as string;

		// Theme Config
		const description = formData.get('description') as string;
		const about = formData.get('about') as string;
		const primaryColor = formData.get('primaryColor') as string;
		const sidebarBg = formData.get('sidebarBg') as string;
		const sidebarText = formData.get('sidebarText') as string;
		const radius = formData.get('radius') as string;

		try {
			const companyService = CompanyModule.getService();
			const current = await companyService.getById(companyId);

			// Merge theme config
			const currentTheme = (current?.themeConfig as Record<string, unknown>) || {};
			const newThemeConfig = {
				...currentTheme,
				description,
				about,
				primaryColor,
				sidebarBg,
				sidebarText,
				radius
			};

			await companyService.updateProfile(companyId, {
				address,
				phone,
				email,
				website,
				isPublic,
				slug,
				themeConfig: newThemeConfig
			});

			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Failed to update settings' });
		}
	}
};
