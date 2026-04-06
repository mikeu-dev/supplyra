import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { companies } from './companies';

// TABEL ROLES
export const roles = pgTable('roles', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 }).references(() => companies.id), // Null for Global/System Roles
	name: varchar('name', { length: 64 }).notNull(), // Remove unique globally, should be unique per company ideally, but for now just remove unique to avoid conflict
	description: varchar('description', { length: 255 }),
	level: varchar('level', { length: 16 }).default('50'), // 1=Superadmin, 10=Admin, 20=Manager, 50=Staff, 99=Guest
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const rolesRelations = relations(roles, ({ many }) => ({
	users: many(users)
}));

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
