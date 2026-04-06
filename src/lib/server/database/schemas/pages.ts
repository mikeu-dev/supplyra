import { pgTable, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// TABEL PAGES (untuk konten statis seperti 'About', 'Contact', dsb.)
export const pages = pgTable('pages', {
	id: varchar('id', { length: 36 }).primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(), // contoh: 'about', 'pricing'
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	content: text('content'),
	published: boolean('published').default(false),
	publishedAt: timestamp('published_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const pagesRelations = relations(pages, () => ({}));

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
