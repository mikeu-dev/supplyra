import { pgTable, varchar, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// TABEL ATTACHMENTS (untuk file yang diupload, bisa untuk berbagai entitas)
export const attachments = pgTable(
	'attachments',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		ownerId: varchar('owner_id', { length: 36 }).notNull(),
		ownerType: varchar('owner_type', { length: 64 }).notNull(),
		docName: varchar('name', { length: 80 }).notNull(),
		url: varchar('url', { length: 512 }).notNull(),
		fileType: varchar('file_type', { length: 64 }),
		size: integer('size'), // byte
		isPublic: boolean('is_public').default(false),
		thumbnailUrl: varchar('thumbnail_url', { length: 512 }),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [index('idx_attachments_owner').on(table.ownerId, table.ownerType)]
);

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
