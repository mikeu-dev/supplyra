import { pgTable, varchar, timestamp, text, date, index, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

export const leaveRequestsTypeEnum = pgEnum('leave_requests_type', [
	'annual',
	'sick',
	'unpaid',
	'other'
]);
export const leaveRequestsStatusEnum = pgEnum('leave_requests_status', [
	'pending',
	'approved',
	'rejected'
]);

export const leaveRequests = pgTable(
	'leave_requests',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: leaveRequestsTypeEnum('type').notNull(),
		startDate: date('start_date').notNull(),
		endDate: date('end_date').notNull(),
		reason: text('reason'),
		status: leaveRequestsStatusEnum('status').default('pending'),
		approvedBy: varchar('approved_by', { length: 36 }).references(() => users.id),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_leaves_user').on(t.userId),
		index('idx_leaves_status').on(t.status),
		index('idx_leaves_dates').on(t.startDate, t.endDate)
	]
);

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
	user: one(users, {
		fields: [leaveRequests.userId],
		references: [users.id],
		relationName: 'requester'
	}),
	approver: one(users, {
		fields: [leaveRequests.approvedBy],
		references: [users.id],
		relationName: 'approver'
	})
}));

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
