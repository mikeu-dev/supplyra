import { AuditService } from '$lib/server/modules/audit/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 25;
	const userId = url.searchParams.get('userId') || undefined;
	const entityType = url.searchParams.get('entityType') || undefined;
	const action = url.searchParams.get('action') as 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'other' || undefined;

	const { items, total } = await AuditService.findMany({
		page,
		limit,
		userId,
		entityType,
		action,
		offset: (page - 1) * limit
	});

	const filters = await AuditService.getAvailableFilters();

	return {
		auditLogs: items,
		total,
		pagination: {
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		},
		filters
	};
};
