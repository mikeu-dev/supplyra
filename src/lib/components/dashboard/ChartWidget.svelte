<script lang="ts">
	import { onMount } from 'svelte';
	import type { ChartType, Chart } from 'chart.js';
	import * as Card from '$lib/components/ui/card';

	let {
		title,
		data,
		labels,
		type = 'bar'
	}: {
		title: string;
		data: number[];
		labels: string[];
		type?: ChartType;
	} = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		const initChart = async () => {
			const ctx = canvas.getContext('2d');

			// Get Theme Colors
			const style = getComputedStyle(document.documentElement);
			const primaryRaw = style.getPropertyValue('--primary').trim();
			const primaryColor = primaryRaw ? `hsl(${primaryRaw})` : '#3b82f6';

			// Palette based on primary but rotating hue/opacity could be complex.
			// For now, keep the vibrant palette but make the first one the primary color.
			const palette = [
				primaryColor, // Company Primary
				'rgba(54, 162, 235, 0.8)',
				'rgba(255, 206, 86, 0.8)',
				'rgba(75, 192, 192, 0.8)',
				'rgba(153, 102, 255, 0.8)',
				'rgba(255, 159, 64, 0.8)'
			];

			if (ctx) {
				const { default: ChartJS } = await import('chart.js/auto');

				// Create gradient
				const gradient = ctx.createLinearGradient(0, 0, 0, 400);
				gradient.addColorStop(0, primaryColor.replace(')', ', 0.2)').replace('hsl(', 'hsla('));
				gradient.addColorStop(1, primaryColor.replace(')', ', 0)').replace('hsl(', 'hsla('));

				chart = new ChartJS(ctx, {
					type: type,
					data: {
						labels: labels,
						datasets: [
							{
								label: title,
								data: data,
								backgroundColor: type === 'line' ? gradient : palette,
								borderColor: primaryColor,
								borderWidth: 3,
								fill: type === 'line',
								tension: 0.4,
								pointBackgroundColor: primaryColor,
								pointBorderColor: '#fff',
								pointBorderWidth: 2,
								pointRadius: 4,
								pointHoverRadius: 6
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								display: false
							},
							tooltip: {
								backgroundColor: 'rgba(0,0,0,0.8)',
								padding: 12,
								titleFont: { size: 14, weight: 'bold' },
								bodyFont: { size: 13 },
								displayColors: false
							}
						},
						scales: {
							y: {
								beginAtZero: true,
								grid: {
									display: true,
									color: 'rgba(0,0,0,0.05)'
								},
								border: { display: false },
								ticks: {
									font: { size: 10 }
								}
							},
							x: {
								grid: {
									display: false
								},
								border: { display: false },
								ticks: {
									font: { size: 10 }
								}
							}
						}
					}
				});
			}
		};

		initChart();

		return () => {
			if (chart) chart.destroy();
		};
	});
</script>

<Card.Root class="col-span-1">
	<Card.Header>
		<Card.Title>{title}</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="h-[300px] w-full">
			<canvas bind:this={canvas}></canvas>
		</div>
	</Card.Content>
</Card.Root>
