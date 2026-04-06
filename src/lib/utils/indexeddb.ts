import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface SyncAction {
	id: string;
	type: 'create' | 'update' | 'delete';
	entity: string;
	data: unknown;
	timestamp: number;
	retryCount: number;
	status: 'pending' | 'syncing' | 'failed' | 'success';
	error?: string;
}

interface CachedData {
	key: string;
	data: unknown;
	timestamp: number;
	expiresAt?: number;
}

interface SVERPDatabase extends DBSchema {
	syncQueue: {
		key: string;
		value: SyncAction;
		indexes: { 'by-status': string; 'by-timestamp': number };
	};
	cachedData: {
		key: string;
		value: CachedData;
		indexes: { 'by-timestamp': number };
	};
	preferences: {
		key: string;
		value: unknown;
	};
}

const DB_NAME = 'supplyra-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SVERPDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase<SVERPDatabase>> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await openDB<SVERPDatabase>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Sync Queue Store
			if (!db.objectStoreNames.contains('syncQueue')) {
				const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
				syncStore.createIndex('by-status', 'status');
				syncStore.createIndex('by-timestamp', 'timestamp');
			}

			// Cached Data Store
			if (!db.objectStoreNames.contains('cachedData')) {
				const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
				cacheStore.createIndex('by-timestamp', 'timestamp');
			}

			// Preferences Store
			if (!db.objectStoreNames.contains('preferences')) {
				db.createObjectStore('preferences');
			}
		}
	});

	return dbInstance;
}

// Sync Queue Operations
export async function addToSyncQueue(
	action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount' | 'status'>
): Promise<string> {
	const db = await getDB();
	const id = `${action.entity}-${action.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const syncAction: SyncAction = {
		...action,
		id,
		timestamp: Date.now(),
		retryCount: 0,
		status: 'pending'
	};

	await db.add('syncQueue', syncAction);
	return id;
}

export async function getSyncQueue(status?: SyncAction['status']): Promise<SyncAction[]> {
	const db = await getDB();

	if (status) {
		return await db.getAllFromIndex('syncQueue', 'by-status', status);
	}

	return await db.getAll('syncQueue');
}

export async function updateSyncAction(id: string, updates: Partial<SyncAction>): Promise<void> {
	const db = await getDB();
	const action = await db.get('syncQueue', id);

	if (action) {
		await db.put('syncQueue', { ...action, ...updates });
	}
}

export async function removeSyncAction(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('syncQueue', id);
}

export async function clearSyncQueue(): Promise<void> {
	const db = await getDB();
	await db.clear('syncQueue');
}

// Cached Data Operations
export async function cacheData(key: string, data: unknown, ttl?: number): Promise<void> {
	const db = await getDB();

	const cachedItem: CachedData = {
		key,
		data,
		timestamp: Date.now(),
		expiresAt: ttl ? Date.now() + ttl : undefined
	};

	await db.put('cachedData', cachedItem);
}

export async function getCachedData<T = unknown>(key: string): Promise<T | null> {
	const db = await getDB();
	const item = await db.get('cachedData', key);

	if (!item) {
		return null;
	}

	// Check if expired
	if (item.expiresAt && item.expiresAt < Date.now()) {
		await db.delete('cachedData', key);
		return null;
	}

	return item.data as T;
}

export async function removeCachedData(key: string): Promise<void> {
	const db = await getDB();
	await db.delete('cachedData', key);
}

export async function clearExpiredCache(): Promise<void> {
	const db = await getDB();
	const allCached = await db.getAll('cachedData');
	const now = Date.now();

	for (const item of allCached) {
		if (item.expiresAt && item.expiresAt < now) {
			await db.delete('cachedData', item.key);
		}
	}
}

// Preferences Operations
export async function setPreference(key: string, value: unknown): Promise<void> {
	const db = await getDB();
	await db.put('preferences', value, key);
}

export async function getPreference<T = unknown>(key: string): Promise<T | null> {
	const db = await getDB();
	const value = await db.get('preferences', key);
	return (value as T) || null;
}

export async function removePreference(key: string): Promise<void> {
	const db = await getDB();
	await db.delete('preferences', key);
}

// Database Management
export async function clearAllData(): Promise<void> {
	const db = await getDB();
	await db.clear('syncQueue');
	await db.clear('cachedData');
	await db.clear('preferences');
}

export async function getDatabaseSize(): Promise<{ quota: number; usage: number }> {
	if ('storage' in navigator && 'estimate' in navigator.storage) {
		const estimate = await navigator.storage.estimate();
		return {
			quota: estimate.quota || 0,
			usage: estimate.usage || 0
		};
	}
	return { quota: 0, usage: 0 };
}
