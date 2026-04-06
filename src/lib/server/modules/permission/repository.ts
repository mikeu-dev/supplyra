import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq, and } from 'drizzle-orm';

export class PermissionRepository {
	async findAll() {
		return await db.select().from(table.permissions);
	}

	async findById(id: string) {
		const result = await db.select().from(table.permissions).where(eq(table.permissions.id, id));
		return result[0] ?? null;
	}

	async findByName(name: string) {
		const result = await db
			.select()
			.from(table.permissions)
			.where(eq(table.permissions.name, name));
		return result[0] ?? null;
	}

	async findByRoleId(roleId: string) {
		const result = await db
			.select({
				permission: table.permissions
			})
			.from(table.rolePermissions)
			.innerJoin(table.permissions, eq(table.rolePermissions.permissionId, table.permissions.id))
			.where(eq(table.rolePermissions.roleId, roleId));

		return result.map((r) => r.permission);
	}

	// Untuk mendapatkan list permission name saja (string[])
	async findPermissionNamesByRoleId(roleId: string): Promise<string[]> {
		const result = await db
			.select({
				name: table.permissions.name
			})
			.from(table.rolePermissions)
			.innerJoin(table.permissions, eq(table.rolePermissions.permissionId, table.permissions.id))
			.where(eq(table.rolePermissions.roleId, roleId));

		return result.map((r) => r.name);
	}

	// Untuk mendapatkan list permission name user spesifik (string[])
	async findPermissionNamesByUserId(userId: string): Promise<string[]> {
		const result = await db
			.select({
				name: table.permissions.name
			})
			.from(table.userPermissions)
			.innerJoin(table.permissions, eq(table.userPermissions.permissionId, table.permissions.id))
			.where(eq(table.userPermissions.userId, userId));

		return result.map((r) => r.name);
	}

	async create(data: table.NewPermission) {
		return await db.insert(table.permissions).values(data);
	}

	async assignToRole(roleId: string, permissionIds: string[]) {
		if (permissionIds.length === 0) return;

		const values = permissionIds.map((pid) => ({
			roleId,
			permissionId: pid
		}));

		// Use insert ignore (or separate check) to avoid duplicates if needed,
		// but for now simple insert. ideally check existence first.
		// using drizzle's onDuplicateKeyUpdate is not standard for all drivers but mysql has it.
		// For safety, let's delete existing for these defaults or just insert.
		// Assuming clean slate or careful management.

		await db.insert(table.rolePermissions).values(values).onConflictDoNothing(); // skip duplicates
	}

	async removePermissionFromRole(roleId: string, permissionId: string) {
		await db
			.delete(table.rolePermissions)
			.where(
				and(
					eq(table.rolePermissions.roleId, roleId),
					eq(table.rolePermissions.permissionId, permissionId)
				)
			);
	}

	async syncRolePermissions(roleId: string, permissionIds: string[]) {
		// Transactional sync: delete all, insert new
		await db.transaction(async (tx) => {
			await tx.delete(table.rolePermissions).where(eq(table.rolePermissions.roleId, roleId));
			if (permissionIds.length > 0) {
				await tx
					.insert(table.rolePermissions)
					.values(permissionIds.map((pid) => ({ roleId, permissionId: pid })));
			}
		});
	}

	async syncUserPermissions(userId: string, permissionIds: string[]) {
		// Transactional sync: delete all, insert new
		await db.transaction(async (tx) => {
			await tx.delete(table.userPermissions).where(eq(table.userPermissions.userId, userId));
			if (permissionIds.length > 0) {
				await tx
					.insert(table.userPermissions)
					.values(permissionIds.map((pid) => ({ userId, permissionId: pid })));
			}
		});
	}
}
