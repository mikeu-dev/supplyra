import { pgTable, varchar, timestamp, boolean, text, json, integer } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL NEWS (untuk artikel atau berita)
export const news = pgTable('news', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => users.id),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	content: text('content').notNull(),
	thumbnail: text('thumbnail'),
	views: integer('views').default(0),
	shares: integer('shares').default(0),
	tags: json('tags'),
	type: varchar('type', { length: 50 }),
	published: boolean('published').default(false), // 'true' atau 'false'
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const newsRelations = relations(news, ({ one }) => ({
	user: one(users, { fields: [news.userId], references: [users.id] })
}));
