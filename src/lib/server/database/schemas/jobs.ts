import { pgTable, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { jobApplicants } from './job-applicants';

// TABEL JOBS
export const jobs = pgTable(
	'jobs',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		title: varchar('title', { length: 255 }).notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		type: varchar('type', { length: 50 }).notNull(), // 'Full-time', 'Part-time', 'Internship', 'Contract'
		location: varchar('location', { length: 255 }).notNull(),
		description: text('description').notNull(), // Rich Text Content
		requirements: text('requirements'), // Rich Text Content
		status: varchar('status', { length: 20 }).default('draft').notNull(), // 'published', 'draft', 'closed'
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [index('idx_jobs_slug').on(table.slug), index('idx_jobs_status').on(table.status)]
);

export const jobsRelations = relations(jobs, ({ many }) => ({
	applicants: many(jobApplicants)
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
