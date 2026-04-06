// src/lib/server/core/base.repository.ts
import { eq } from 'drizzle-orm';
import type { PgTable, PgColumn, TableConfig } from 'drizzle-orm/pg-core';
import { db } from '$lib/server/database';

type TableWithId = PgTable<TableConfig> & {
	id: PgColumn;
};

export abstract class BaseRepository<
	TTable extends TableWithId,
	TEntity extends TTable['$inferSelect'],
	TCreate extends TTable['$inferInsert'] & { id: string }
> {
	protected table: TTable;

	constructor(table: TTable) {
		this.table = table;
	}

	async findAll(): Promise<TEntity[]> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (await db.select().from(this.table as any)) as TEntity[];
	}

	async findById(id: string): Promise<TEntity | null> {
		const result = await db
			.select()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.from(this.table as any)
			.where(eq(this.table.id, id));
		return (result[0] as TEntity) ?? null;
	}

	async create(data: TCreate): Promise<TEntity> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await db.insert(this.table as any).values(data as any);
		const newRecord = await this.findById(data.id);
		if (!newRecord) throw new Error('Failed to create and retrieve new record.');
		return newRecord;
	}

	async update(id: string, data: Partial<TCreate>): Promise<void> {
		await db
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.update(this.table as any)
			.set(data)
			.where(eq(this.table.id, id));
	}

	async delete(id: string): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await db.delete(this.table as any).where(eq(this.table.id, id));
	}
}
