import { pgTable, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { jobs } from './jobs';

// TABEL JOB APPLICANTS
export const jobApplicants = pgTable(
	'job_applicants',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		jobId: varchar('job_id', { length: 36 })
			.references(() => jobs.id)
			.notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 50 }).notNull(),
		resume: varchar('resume', { length: 255 }).notNull(), // Path to uploaded PDF
		coverLetter: text('cover_letter'),
		status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'reviewed', 'interview', 'hired', 'rejected'
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_job_applicants_job_id').on(table.jobId),
		index('idx_job_applicants_email').on(table.email)
	]
);

export const jobApplicantsRelations = relations(jobApplicants, ({ one }) => ({
	job: one(jobs, { fields: [jobApplicants.jobId], references: [jobs.id] })
}));

export type JobApplicant = typeof jobApplicants.$inferSelect;
export type NewJobApplicant = typeof jobApplicants.$inferInsert;
