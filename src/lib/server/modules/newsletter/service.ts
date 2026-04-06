// src/lib/server/services/newsletter.service.ts
import * as table from '$lib/server/database/schemas';
import { mailer } from '$lib/server/modules/email/transport';
import { BaseService } from '$lib/server/core/base.service';
import type { NewsletterRepository } from './repository';
import type { INewsletterService } from './interfaces/INewsletterService';
import { NewsletterRepository as NewsletterRepositoryImpl } from './repository';
import { WelcomeEmailTemplate } from '$lib/server/templates/email/welcome';
import { BroadcastEmailTemplate } from '$lib/server/templates/email/broadcast';

export class NewsletterService
	extends BaseService<table.NewsletterSubscription, table.NewNewsletterSubscription>
	implements INewsletterService
{
	// We need to cast the repository to the specific type to access getByEmail
	protected override repository: NewsletterRepository;

	constructor(repository = new NewsletterRepositoryImpl()) {
		super(repository);
		this.repository = repository;
	}

	async getNewsletterByEmail(email: string): Promise<table.NewsletterSubscription | null> {
		return this.repository.getByEmail(email);
	}

	async subscribe(email: string): Promise<void> {
		const existing = await this.repository.getByEmail(email);
		if (existing) {
			if (!existing.isSubscribed) {
				await this.repository.update(existing.id, { isSubscribed: true });
			}
			return;
		}

		await this.create({ email });

		await mailer.queueMail({
			to: email,
			subject: 'Selamat Datang di Newsletter Supplyra',
			html: WelcomeEmailTemplate(email)
		});
	}

	async sendBroadcast(subject: string, content: string): Promise<void> {
		const subscribers = await this.repository.getAllActive();
		const html = BroadcastEmailTemplate(content, subject);

		for (const subscriber of subscribers) {
			await mailer.queueMail({
				to: subscriber.email,
				subject: subject,
				html
			});
		}
	}
}
