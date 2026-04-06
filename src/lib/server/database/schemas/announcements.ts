import { pgTable, varchar, timestamp, json, index, pgEnum, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL ANNOUNCEMENTS (untuk pengumuman/broadcast dari admin)
export const announcementsPriorityEnum = pgEnum('announcements_priority', ['normal', 'urgent']);
export const announcementsTargetTypeEnum = pgEnum('announcements_target_type', [
	'all',
	'role',
	'user'
]);
export const announcementsStatusEnum = pgEnum('announcements_status', [
	'draft',
	'published',
	'archived'
]);

export const announcements = pgTable(
	'announcements',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		createdBy: varchar('created_by', { length: 36 })
			.notNull()
			.references(() => users.id),
		title: varchar('title', { length: 255 }).notNull(),
		content: text('content').notNull(),
		priority: announcementsPriorityEnum('priority').default('normal'),
		targetType: announcementsTargetTypeEnum('target_type').notNull(),
		targetValue: json('target_value'), // null for 'all', array of role IDs or user IDs
		status: announcementsStatusEnum('status').default('draft'),
		publishedAt: timestamp('published_at'),
		expiresAt: timestamp('expires_at'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_announcements_status').on(table.status),
		index('idx_announcements_created_by').on(table.createdBy)
	]
);

export const announcementsRelations = relations(announcements, ({ one }) => ({
	creator: one(users, { fields: [announcements.createdBy], references: [users.id] })
}));

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
