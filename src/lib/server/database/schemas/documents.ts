import { pgTable, varchar, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// TABEL DOCUMENTS (polymorphic)
export const documents = pgTable(
	'documents',
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
	(table) => [index('idx_documents_owner').on(table.ownerType, table.ownerId)]
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
