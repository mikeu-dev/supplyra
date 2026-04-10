<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from './$types';
	import { toast } from 'svelte-sonner';

	import type { PageData } from './$types';

	interface CompanyData {
		id?: string;
		name?: string;
		slug?: string;
		themeConfig?: Record<string, unknown>;
		isPublic?: boolean;
		email?: string;
		phone?: string;
		address?: string;
		website?: string;
	}

	let { data }: { data: PageData } = $props();
	let company: CompanyData = $derived(
		(data.company as CompanyData) || ({ themeConfig: {} } as CompanyData)
	);
	let themeConfig = $derived((company.themeConfig as Record<string, unknown>) || {});

	// Switch binding needs boolean, form requires input submission
	// We bind switch to a variable, and use a hidden input for form submission
	let isPublic = $state(false);
	let signatureBase64 = $state('');

	$effect(() => {
		if (company && typeof company.isPublic !== 'undefined') {
			isPublic = !!company.isPublic;
		}
		
		// Set initial signature if exists and local state is empty
		if (themeConfig.signatureBase64 && !signatureBase64) {
			signatureBase64 = themeConfig.signatureBase64 as string;
		}
	});

	function handleSignatureChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Basic size validation (< 500KB)
		if (file.size > 500 * 1024) {
			toast.error('Image size should be less than 500KB');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result && typeof e.target.result === 'string') {
				signatureBase64 = e.target.result;
			}
		};
		reader.readAsDataURL(file);
	}

	const handleResult: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Settings updated successfully');
			} else {
				toast.error('Failed to update settings');
			}
		};
	};
</script>

<div class="flex max-w-4xl flex-col gap-6 p-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Company Settings
		</h1>
		<p class="text-muted-foreground">Manage your company profile and public presence.</p>
	</div>

	<form method="POST" action="?/update" use:enhance={handleResult} class="space-y-6">
		<!-- Contact Info -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Contact Information</Card.Title>
				<Card.Description>Displayed on your invoices and public profile.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" value={company.email} />
				</div>
				<div class="space-y-2">
					<Label for="phone">Phone</Label>
					<Input id="phone" name="phone" value={company.phone} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="address">Address</Label>
					<Textarea id="address" name="address" value={company.address} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="website">Website</Label>
					<Input id="website" name="website" value={company.website} />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Public Profile -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Public Profile Configuration</Card.Title>
				<Card.Description>Settings for your public landing page ({company.slug}).</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center space-x-2">
					<Switch id="isPublic" bind:checked={isPublic} />
					<Label for="isPublic">Enable Public Profile</Label>
					<input type="hidden" name="isPublic" value={isPublic ? 'on' : 'off'} />
				</div>

				<div class="space-y-2">
					<Label for="slug">URL Slug</Label>
					<div class="flex items-center gap-1">
						<span class="text-muted-foreground text-sm">/p/</span>
						<Input id="slug" name="slug" value={company.slug} />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">Tagline / Short Description</Label>
					<Input
						id="description"
						name="description"
						value={(themeConfig.description as string) || ''}
						placeholder="Ex: Innovating the future"
					/>
				</div>

				<div class="space-y-2">
					<Label for="about">About Us (Detailed)</Label>
					<Textarea
						id="about"
						name="about"
						value={(themeConfig.about as string) || ''}
						rows={5}
						placeholder="Full description of your company..."
					/>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="primaryColor">Primary Theme Color</Label>
							<div class="flex items-center gap-2">
								<Input
									type="color"
									id="primaryColor"
									name="primaryColor"
									value={(themeConfig.primaryColor as string) || '#0047FF'}
									class="h-10 w-16 p-1"
								/>
								<Input
									value={(themeConfig.primaryColor as string) || '#0047FF'}
									readonly
									class="w-24 bg-muted"
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="sidebarBg">Sidebar Background</Label>
							<div class="flex items-center gap-2">
								<Input
									type="color"
									id="sidebarBg"
									name="sidebarBg"
									value={(themeConfig.sidebarBg as string) || '#ffffff'}
									class="h-10 w-16 p-1"
								/>
								<Input
									value={(themeConfig.sidebarBg as string) || '#ffffff'}
									readonly
									class="w-24 bg-muted"
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="radius">Corner Radius (px)</Label>
							<div class="flex items-center gap-4">
								<input 
									type="range" 
									id="radius" 
									name="radius" 
									min="0" 
									max="1" 
									step="0.1" 
									value={(themeConfig.radius as string) || '0.5'}
									class="flex-1"
								/>
								<span class="text-xs font-bold w-12 text-center border rounded bg-muted py-1">
									{(themeConfig.radius as string) || '0.5'}rem
								</span>
							</div>
						</div>
					</div>

					<!-- Branding Preview Card -->
					<div class="rounded-xl border bg-slate-50 p-6 dark:bg-slate-900 flex flex-col gap-4">
						<div class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Branding Preview</div>
						
						<div class="flex flex-1 gap-2 border rounded-lg bg-background overflow-hidden shadow-sm">
							<!-- Mini Sidebar -->
							<div class="w-12 border-r flex flex-col gap-2 p-2 shadow-inner" style="background-color: {themeConfig.sidebarBg || '#ffffff'}">
								<div class="h-4 w-4 rounded-full" style="background-color: {themeConfig.primaryColor || '#0047FF'}"></div>
								<div class="h-2 w-full rounded-full bg-slate-200"></div>
								<div class="h-2 w-full rounded-full bg-slate-200"></div>
							</div>
							<!-- Mini Content -->
							<div class="flex-1 p-3 flex flex-col gap-3">
								<div class="flex justify-between items-center">
									<div class="h-3 w-16 bg-slate-200 rounded"></div>
									<div class="h-4 w-4 bg-slate-100 rounded-full border"></div>
								</div>
								<div class="h-12 w-full rounded-md shadow-sm border flex items-center px-2" style="border-radius: {themeConfig.radius || '0.5'}rem">
									<div class="h-2 w-20 bg-primary/20 rounded"></div>
								</div>
								<div class="h-10 w-24 ml-auto rounded-md flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style="background-color: {themeConfig.primaryColor || '#0047FF'}; border-radius: {themeConfig.radius || '0.5'}rem">
									SIGN IN
								</div>
							</div>
						</div>
						<p class="text-[10px] text-center text-muted-foreground italic">Pratinjau visual berdasarkan pengaturan di atas.</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Official Document Signature -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Official Document Signature</Card.Title>
				<Card.Description>Upload an authorized signature (transparent PNG) to be appended to official generated documents like invoices.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="signatureUpload">Signature Image (Max 500KB)</Label>
					<Input
						id="signatureUpload"
						type="file"
						accept="image/png, image/jpeg"
						onchange={handleSignatureChange}
					/>
					<input type="hidden" name="signatureBase64" value={signatureBase64} />
				</div>

				{#if signatureBase64}
					<div class="mt-4 flex flex-col gap-2">
						<Label>Preview</Label>
						<div class="relative w-48 h-24 border rounded-md bg-stone-100 flex items-center justify-center overflow-hidden custom-checkerboard">
							<!-- Checkerboard bg to see transparency -->
							<img src={signatureBase64} alt="Signature Preview" class="max-h-full object-contain" />
						</div>
						<Button variant="outline" size="sm" class="w-48 text-red-600 hover:text-red-700 hover:bg-red-50" onclick={(e) => { e.preventDefault(); signatureBase64 = ''; }}>
							Remove Signature
						</Button>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer>
				<Button type="submit" class="w-full md:w-auto">Simpan Konfigurasi Brand</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
