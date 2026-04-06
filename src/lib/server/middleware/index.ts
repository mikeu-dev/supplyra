import type { Handle } from '@sveltejs/kit';
import { logger } from '$lib/server/modules/core/logger';
import { cache } from '$lib/server/core/cache';
import { createGzip, createBrotliCompress, constants } from 'zlib';

export { requireAuth, requirePermission, requireRole } from './auth-guard';
export { rateLimitMiddleware, checkRateLimit } from './rate-limiter';

/**
 * Response compression middleware
 * Compresses responses using gzip or brotli based on Accept-Encoding header
 */
export const compressionMiddleware: Handle = async ({ event, resolve }) => {
	const { request } = event;
	const acceptEncoding = request.headers.get('accept-encoding') || '';

	// Resolve the request
	const response = await resolve(event);

	// Only compress successful responses with body
	if (response.status !== 200 || !response.body) {
		return response;
	}

	// Skip compression for small responses (< 1KB)
	const contentLength = response.headers.get('content-length');
	if (contentLength && parseInt(contentLength) < 1024) {
		return response;
	}

	// Skip compression for already compressed content
	const contentType = response.headers.get('content-type') || '';
	const skipTypes = [
		'image/',
		'video/',
		'audio/',
		'application/zip',
		'application/gzip',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	];
	if (skipTypes.some((type) => contentType.includes(type))) {
		return response;
	}

	try {
		const body = await response.text();

		// Brotli compression (better compression ratio)
		if (acceptEncoding.includes('br')) {
			const compressed = await compressBrotli(body);
			return new Response(compressed as BodyInit, {
				status: response.status,
				headers: {
					...Object.fromEntries(response.headers),
					'content-encoding': 'br',
					'content-length': compressed.length.toString(),
					vary: 'Accept-Encoding'
				}
			});
		}

		// Gzip compression (widely supported)
		if (acceptEncoding.includes('gzip')) {
			const compressed = await compressGzip(body);
			return new Response(compressed as BodyInit, {
				status: response.status,
				headers: {
					...Object.fromEntries(response.headers),
					'content-encoding': 'gzip',
					'content-length': compressed.length.toString(),
					vary: 'Accept-Encoding'
				}
			});
		}

		// No compression support
		return new Response(body, {
			status: response.status,
			headers: response.headers
		});
	} catch (error) {
		logger.error('Compression middleware error:', error);
		return response;
	}
};

/**
 * Enhanced cache middleware for API routes
 */
export const cacheMiddleware: Handle = async ({ event, resolve }) => {
	const { request, url } = event;

	// Only cache GET requests
	if (request.method !== 'GET') {
		return resolve(event);
	}

	// Skip caching for certain paths
	const skipPaths = ['/api/sse', '/api/auth', '/storage', '/panel'];
	if (skipPaths.some((path) => url.pathname.startsWith(path))) {
		return resolve(event);
	}

	// Only cache API routes
	if (!url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	// Generate cache key from URL and query params
	const cacheKey = `http:${url.pathname}:${url.search}`;

	try {
		// Try to get from cache
		const cached = await cache.get<{
			body: string;
			headers: Record<string, string>;
			status: number;
		}>(cacheKey);

		if (cached) {
			logger.info(`Cache HIT: ${cacheKey}`);
			return new Response(cached.body, {
				status: cached.status,
				headers: {
					...cached.headers,
					'X-Cache': 'HIT',
					'X-Cache-Key': cacheKey
				}
			});
		}

		// Resolve request
		const response = await resolve(event);

		// Only cache successful responses
		if (response.status === 200) {
			const body = await response.text();
			const headers: Record<string, string> = {};

			response.headers.forEach((value, key) => {
				headers[key] = value;
			});

			// Determine TTL based on path
			let ttl = 300; // Default 5 minutes
			if (url.pathname.includes('/dashboard')) {
				ttl = 300; // 5 minutes for dashboard
			} else if (url.pathname.includes('/reporting')) {
				ttl = 600; // 10 minutes for reports
			} else if (url.pathname.includes('/stats')) {
				ttl = 300; // 5 minutes for stats
			}

			// Cache the response
			await cache.set(cacheKey, { body, headers, status: response.status }, ttl);

			logger.info(`Cache MISS: ${cacheKey} (TTL: ${ttl}s)`);

			return new Response(body, {
				status: response.status,
				headers: {
					...headers,
					'X-Cache': 'MISS',
					'X-Cache-Key': cacheKey,
					'X-Cache-TTL': ttl.toString()
				}
			});
		}

		return response;
	} catch (error) {
		logger.error('Cache middleware error:', error);
		return resolve(event);
	}
};

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const { url, request } = event;

	const response = await resolve(event);

	const duration = Date.now() - start;
	const cacheStatus = response.headers.get('X-Cache') || 'N/A';

	logger.info(
		`${request.method} ${url.pathname} - ${response.status} - ${duration}ms - Cache: ${cacheStatus}`
	);

	// Add performance headers
	return new Response(response.body, {
		status: response.status,
		headers: {
			...Object.fromEntries(response.headers),
			'X-Response-Time': `${duration}ms`,
			'X-Powered-By': 'Supplyra'
		}
	});
};

// Helper functions
async function compressGzip(data: string): Promise<Buffer> {
	const gzip = createGzip({ level: 6 }); // Balanced compression level
	const chunks: Buffer[] = [];

	return new Promise((resolve, reject) => {
		gzip.on('data', (chunk) => chunks.push(chunk));
		gzip.on('end', () => resolve(Buffer.concat(chunks)));
		gzip.on('error', reject);
		gzip.write(data);
		gzip.end();
	});
}

async function compressBrotli(data: string): Promise<Buffer> {
	const brotli = createBrotliCompress({
		params: {
			[constants.BROTLI_PARAM_QUALITY]: 4
		}
	});
	const chunks: Buffer[] = [];

	return new Promise((resolve, reject) => {
		brotli.on('data', (chunk) => chunks.push(chunk));
		brotli.on('end', () => resolve(Buffer.concat(chunks)));
		brotli.on('error', reject);
		brotli.write(data);
		brotli.end();
	});
}
