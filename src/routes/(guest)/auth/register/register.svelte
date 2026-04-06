<script lang="ts">
	import { untrack } from 'svelte';
	import {
		FormField,
		FormControl,
		FormLabel,
		FormDescription,
		FormFieldErrors,
		FormButton
	} from '$lib/components/ui/form/index.js';
	import { m } from '$lib/paraglide/messages';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formSchema, type FormSchema } from '$lib/schemas/auth/register';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(formSchema)
		}
	);

	const { form: formData, enhance } = form;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<img
			class="mx-auto h-10 w-auto"
			src="/logo.png"
			alt="Supplyra ERP"
		/>
		<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
			{m.register_text()}
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" method="POST" use:enhance>
			<FormField {form} name="name">
				<FormControl>
					{#snippet children({ props })}
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<FormLabel for="name">{m.name_label()}</FormLabel>
							<Input
								{...props}
								bind:value={$formData.name}
								autocomplete="name"
								required
								placeholder={m.name_label()}
							/>
						</div>
					{/snippet}
				</FormControl>
				<FormDescription
					>{m.label_interupt({ name: m.name_label().toLocaleLowerCase() })}</FormDescription
				>
				<FormFieldErrors />
			</FormField>
			<FormField {form} name="email">
				<FormControl>
					{#snippet children({ props })}
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<FormLabel for="email">{m.email_label()}</FormLabel>
							<Input
								{...props}
								bind:value={$formData.email}
								autocomplete="email"
								required
								placeholder={m.email_label()}
							/>
						</div>
					{/snippet}
				</FormControl>
				<FormDescription
					>{m.label_interupt({ name: m.email_label().toLocaleLowerCase() })}</FormDescription
				>
				<FormFieldErrors />
			</FormField>
			<FormField {form} name="password">
				<FormControl>
					{#snippet children({ props })}
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<FormLabel for="password">{m.password_label()}</FormLabel>
							<Input
								{...props}
								bind:value={$formData.password}
								autocomplete="current-password"
								type="password"
								required
								placeholder={m.password_label()}
							/>
						</div>
					{/snippet}
				</FormControl>
				<FormDescription
					>{m.label_interupt({ name: m.password_label().toLocaleLowerCase() })}</FormDescription
				>
				<FormFieldErrors />
			</FormField>
			<FormField {form} name="confirmPassword">
				<FormControl>
					{#snippet children({ props })}
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<FormLabel for="confirmPassword">{m.confirm_password_label()}</FormLabel>
							<Input
								{...props}
								bind:value={$formData.confirmPassword}
								autocomplete="off"
								type="password"
								required
								placeholder={m.confirm_password_label()}
							/>
						</div>
					{/snippet}
				</FormControl>
				<FormDescription>{m.confirm_interupt()}</FormDescription>
				<FormFieldErrors />
			</FormField>

			<div>
				<FormButton class="flex w-full justify-center">{m.btn_register_label()}</FormButton>
			</div>
		</form>
	</div>
</div>
