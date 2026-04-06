import * as table from '$lib/server/database/schemas';
import { db } from '$lib/server/database';
import { eq, and, count, desc, isNotNull, lte } from 'drizzle-orm';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IAnnouncementRepository } from './interfaces/IAnnouncementRepository';

export class AnnouncementRepository
	extends BaseRepository<typeof table.announcements, table.Announcement, table.NewAnnouncement>
	implements IAnnouncementRepository
{
	constructor() {
		super(table.announcements);
	}

	async getPaginated(
		page: number,
		limit: number,
		statusFilter?: string
	): Promise<{ data: table.Announcement[]; total: number }> {
		const offset = (page - 1) * limit;

		const conditions = [];
		if (statusFilter && ['draft', 'published', 'archived'].includes(statusFilter)) {
			conditions.push(
				eq(table.announcements.status, statusFilter as 'draft' | 'published' | 'archived')
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const data = await db
			.select()
			.from(table.announcements)
			.where(whereClause)
			.orderBy(desc(table.announcements.createdAt))
			.limit(limit)
			.offset(offset);

		const countResult = await db
			.select({ count: count() })
			.from(table.announcements)
			.where(whereClause);

		return {
			data,
			total: countResult[0]?.count || 0
		};
	}

	async getByIdWithCreator(id: string) {
		// Fallback untuk MariaDB yang tidak support LEFT JOIN LATERAL (dipakai oleh Drizzle relational query)
		const rows = await db
			.select({
				announcement: table.announcements,
				creator: {
					name: table.users.name
				}
			})
			.from(table.announcements)
			.leftJoin(table.users, eq(table.announcements.createdBy, table.users.id))
			.where(eq(table.announcements.id, id))
			.limit(1);

		if (rows.length === 0) return null;

		const row = rows[0];
		return {
			...row.announcement,
			creator: row.creator?.name ? { name: row.creator.name } : undefined
		};
	}

	async getRecipientStats(announcementId: string) {
		const totalResult = await db
			.select({ count: count() })
			.from(table.announcementRecipients)
			.where(eq(table.announcementRecipients.announcementId, announcementId));

		const readResult = await db
			.select({ count: count() })
			.from(table.announcementRecipients)
			.where(
				and(
					eq(table.announcementRecipients.announcementId, announcementId),
					isNotNull(table.announcementRecipients.readAt)
				)
			);

		const total = totalResult[0]?.count || 0;
		const read = readResult[0]?.count || 0;

		return { total, read, unread: total - read };
	}

	async createRecipients(recipients: table.NewAnnouncementRecipient[]) {
		if (recipients.length === 0) return;
		await db.insert(table.announcementRecipients).values(recipients);
	}

	async markRecipientAsRead(announcementId: string, userId: string) {
		await db
			.update(table.announcementRecipients)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(table.announcementRecipients.announcementId, announcementId),
					eq(table.announcementRecipients.userId, userId)
				)
			);
	}

	async getAnnouncementsForUser(userId: string, page: number, limit: number) {
		const offset = (page - 1) * limit;

		const data = await db
			.select({
				announcement: table.announcements,
				readAt: table.announcementRecipients.readAt
			})
			.from(table.announcementRecipients)
			.innerJoin(
				table.announcements,
				eq(table.announcementRecipients.announcementId, table.announcements.id)
			)
			.where(eq(table.announcementRecipients.userId, userId))
			.orderBy(desc(table.announcements.publishedAt))
			.limit(limit)
			.offset(offset);

		const countResult = await db
			.select({ count: count() })
			.from(table.announcementRecipients)
			.where(eq(table.announcementRecipients.userId, userId));

		return {
			data,
			total: countResult[0]?.count || 0
		};
	}

	async archiveExpired(): Promise<number> {
		const now = new Date();
		const result = await db
			.update(table.announcements)
			.set({ status: 'archived' })
			.where(
				and(
					eq(table.announcements.status, 'published'),
					isNotNull(table.announcements.expiresAt),
					lte(table.announcements.expiresAt, now)
				)
			)
			.returning({ id: table.announcements.id });

		return result.length;
	}
}
