import { pgTable, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL AUDIT LOGS
export const auditLogsActionEnum = pgEnum('audit_logs_action', [
	'create',
	'update',
	'delete',
	'login',
	'logout',
	'export',
	'other'
]);

export const auditLogs = pgTable('audit_logs', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
	action: auditLogsActionEnum('action').notNull(),
	entityType: varchar('entity_type', { length: 100 }).notNull(), // e.g., 'presence', 'payroll', 'employee'
	entityId: varchar('entity_id', { length: 36 }), // ID of the affected record
	oldValue: text('old_value'), // JSON string of old values (for update/delete)
	newValue: text('new_value'), // JSON string of new values (for create/update)
	ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
	userAgent: varchar('user_agent', { length: 500 }),
	createdAt: timestamp('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull()
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	user: one(users, { fields: [auditLogs.userId], references: [users.id] })
}));
