import { db } from '$lib/server/database';
import { auditLogs } from '$lib/server/database/schemas';
import { generateId } from '$lib/utils/useUserId';
import { AuditRepository, type AuditLogFilter } from './repository';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'other';

export interface AuditLogInput {
	userId?: string | null;
	action: AuditAction;
	entityType: string;
	entityId?: string | null;
	oldValue?: unknown;
	newValue?: unknown;
	ipAddress?: string | null;
	userAgent?: string | null;
}

const repository = new AuditRepository();

export class AuditService {
	/**
	 * Find audit logs with filters
	 */
	static async findMany(filters: AuditLogFilter) {
		const [items, total] = await Promise.all([
			repository.getAuditLogs(filters),
			repository.countAuditLogs(filters)
		]);

		return { items, total };
	}

	/**
	 * Get all available entity types for filtering
	 */
	static async getAvailableFilters() {
		const types = await repository.getEntityTypes();
		return { entityTypes: types };
	}

	/**
	 * Log an action to the audit log
	 */
	static async log(input: AuditLogInput): Promise<void> {
		try {
			await db.insert(auditLogs).values({
				id: generateId(),
				userId: input.userId || null,
				action: input.action,
				entityType: input.entityType,
				entityId: input.entityId || null,
				oldValue: input.oldValue ? JSON.stringify(input.oldValue) : null,
				newValue: input.newValue ? JSON.stringify(input.newValue) : null,
				ipAddress: input.ipAddress || null,
				userAgent: input.userAgent || null
			});
		} catch (error) {
			// Log error but don't throw - audit logging should not break main flow
			console.error('Failed to write audit log:', error);
		}
	}

	/**
	 * Log a create action
	 */
	static async logCreate(
		userId: string | null,
		entityType: string,
		entityId: string,
		newValue: unknown,
		ipAddress?: string,
		userAgent?: string
	): Promise<void> {
		return this.log({
			userId,
			action: 'create',
			entityType,
			entityId,
			newValue,
			ipAddress,
			userAgent
		});
	}

	/**
	 * Log an update action
	 */
	static async logUpdate(
		userId: string | null,
		entityType: string,
		entityId: string,
		oldValue: unknown,
		newValue: unknown,
		ipAddress?: string,
		userAgent?: string
	): Promise<void> {
		return this.log({
			userId,
			action: 'update',
			entityType,
			entityId,
			oldValue,
			newValue,
			ipAddress,
			userAgent
		});
	}

	/**
	 * Log a delete action
	 */
	static async logDelete(
		userId: string | null,
		entityType: string,
		entityId: string,
		oldValue: unknown,
		ipAddress?: string,
		userAgent?: string
	): Promise<void> {
		return this.log({
			userId,
			action: 'delete',
			entityType,
			entityId,
			oldValue,
			ipAddress,
			userAgent
		});
	}

	/**
	 * Log an export action
	 */
	static async logExport(
		userId: string | null,
		entityType: string,
		filters?: unknown,
		ipAddress?: string,
		userAgent?: string
	): Promise<void> {
		return this.log({
			userId,
			action: 'export',
			entityType,
			newValue: filters,
			ipAddress,
			userAgent
		});
	}
}
