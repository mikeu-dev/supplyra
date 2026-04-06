import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { rolePermissions } from './role-permissions';
import { userPermissions } from './user-permissions';

// TABEL PERMISSIONS
export const permissions = pgTable('permissions', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 64 }).notNull().unique(), // e.g., 'users.create'
	description: varchar('description', { length: 255 }),
	resource: varchar('resource', { length: 50 }).notNull(), // e.g., 'users'
	action: varchar('action', { length: 50 }).notNull(), // e.g., 'create'
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userPermissions: many(userPermissions)
}));

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
