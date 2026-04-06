import { pgTable, varchar, timestamp, text, json, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL NOTIFICATIONS (untuk sistem notifikasi)
export const notificationsTypeEnum = pgEnum('notifications_type', [
	'info',
	'warning',
	'success',
	'error',
	'task',
	'system'
]);

export const notifications = pgTable('notifications', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => users.id),
	title: varchar('title', { length: 255 }).notNull(),
	message: text('message'),
	type: notificationsTypeEnum('type').default('info'),
	actionUrl: varchar('action_url', { length: 500 }),
	metadata: json('metadata'),
	readAt: timestamp('read_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, { fields: [notifications.userId], references: [users.id] })
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
