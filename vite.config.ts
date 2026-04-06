import { svelteTesting } from '@testing-library/svelte/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'development',
			scope: '/',
			base: '/',
			selfDestroying: process.env.SELF_DESTROYING_SW === 'true',
			manifest: {
				short_name: 'Supplyra',
				name: 'Supplyra ERP',
				start_url: '/panel',
				scope: '/',
				display: 'standalone',
				theme_color: '#0f172a',
				background_color: '#ffffff',
				orientation: 'portrait-primary',
				categories: ['business', 'productivity'],
				description: 'Enterprise Resource Planning System by Supplyra',
				icons: [
					{
						src: '/icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png',
						purpose: 'any maskable'
					}
				],
				shortcuts: [
					{
						name: 'Dashboard',
						short_name: 'Dashboard',
						description: 'View dashboard',
						url: '/panel',
						icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
					},
					{
						name: 'Projects',
						short_name: 'Projects',
						description: 'Manage projects',
						url: '/panel/project',
						icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
					},
					{
						name: 'Tasks',
						short_name: 'Tasks',
						description: 'Manage tasks',
						url: '/panel/task',
						icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
					},
					{
						name: 'Expenses',
						short_name: 'Expenses',
						description: 'Track expenses',
						url: '/panel/finance/expense',
						icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
					}
				]
			},
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /\/api\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 5 // 5 minutes
							},
							cacheableResponse: {
								statuses: [0, 200]
							},
							networkTimeoutSeconds: 10
						}
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'fonts-cache',
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			devOptions: {
				enabled: false,
				type: 'module',
				navigateFallback: '/'
			}
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	resolve: {
		alias: {
			$components: path.resolve('./src/lib/components'),
			$stores: path.resolve('./src/lib/stores'),
			$utils: path.resolve('./src/lib/utils'),
			$assets: path.resolve('./src/lib/assets'),
			$routes: path.resolve('./src/lib/routes'),
			$types: path.resolve('./src/lib/types'),
			$lib: path.resolve('./src/lib')
		}
	},
	build: {
		target: 'es2020',
		minify: 'esbuild',
		cssMinify: true,
		commonjsOptions: {
			include: [/node_modules/],
			transformMixedEsModules: true
		},
		rollupOptions: {
			onwarn(warning, warn) {
				if (warning.code === 'CIRCULAR_DEPENDENCY') return;
				if (
					warning.message.includes('One of the glob patterns') ||
					warning.message.includes('globDirectory') ||
					warning.message.includes('Circular dependency: node_modules') ||
					warning.message.includes('node_modules/@internationalized/date') ||
					warning.message.includes('node_modules/zod-to-json-schema')
				)
					return;
				warn(warning);
			},
			external: [
				'node:dns',
				'node:dns/promises',
				'pdfmake',
				'exceljs',
				'pdfmake/build/pdfmake',
				'pdfmake/build/vfs_fonts'
			],
			// maxParallelFileOps: 20, // default is fine for most cases
			output: {
				// Simplified manualChunks to reduce memory pressure
			}
		},
		chunkSizeWarningLimit: 2000,
		reportCompressedSize: false,
		sourcemap: false
	},
	ssr: {
		noExternal: []
	},
	optimizeDeps: {
		include: ['svelte', '@sveltejs/kit', 'chart.js', 'date-fns'],
		exclude: ['pdfmake', 'exceljs']
	},
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					setupFiles: ['./vitest-setup-server.ts']
				}
			}
		]
	}
});
