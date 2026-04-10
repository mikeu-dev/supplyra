import { db } from '$lib/server/database';
import { auditLogs, users } from '$lib/server/database/schemas';
import { eq, desc, and, sql } from 'drizzle-orm';

export interface AuditLogFilter {
	userId?: string;
	entityType?: string;
	action?: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'other';
	limit?: number;
	offset?: number;
}

export class AuditRepository {
	async getAuditLogs(filters: AuditLogFilter) {
		const conditions = [];

		if (filters.userId) {
			conditions.push(eq(auditLogs.userId, filters.userId));
		}

		if (filters.entityType) {
			conditions.push(eq(auditLogs.entityType, filters.entityType));
		}

		if (filters.action) {
			conditions.push(eq(auditLogs.action, filters.action));
		}

		const query = db
			.select({
				id: auditLogs.id,
				action: auditLogs.action,
				entityType: auditLogs.entityType,
				entityId: auditLogs.entityId,
				oldValue: auditLogs.oldValue,
				newValue: auditLogs.newValue,
				ipAddress: auditLogs.ipAddress,
				userAgent: auditLogs.userAgent,
				createdAt: auditLogs.createdAt,
				user: {
					id: users.id,
					name: users.name,
					email: users.email
				}
			})
			.from(auditLogs)
			.leftJoin(users, eq(auditLogs.userId, users.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(auditLogs.createdAt))
			.limit(filters.limit || 50)
			.offset(filters.offset || 0);

		return await query;
	}

	async countAuditLogs(filters: AuditLogFilter) {
		const conditions = [];

		if (filters.userId) {
			conditions.push(eq(auditLogs.userId, filters.userId));
		}

		if (filters.entityType) {
			conditions.push(eq(auditLogs.entityType, filters.entityType));
		}

		if (filters.action) {
			conditions.push(eq(auditLogs.action, filters.action));
		}

		const result = await db
			.select({
				count: sql<number>`count(*)`
			})
			.from(auditLogs)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		return result[0].count;
	}

	async getEntityTypes() {
		const result = await db
			.selectDistinct({
				entityType: auditLogs.entityType
			})
			.from(auditLogs);
		
		return result.map(r => r.entityType);
	}
}
