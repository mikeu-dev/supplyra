import { mailer } from '$lib/server/modules/email/transport';
import { PayslipEmailTemplate } from '$lib/server/templates/email/payslip';
import { PasswordResetEmailTemplate } from '$lib/server/templates/email/reset-password';

export class EmailService {
	constructor() {}

	async sendPayslip(to: string, name: string, period: string, amount: string) {
		const html = PayslipEmailTemplate(name, period, amount);

		return await mailer.queueMail({
			from: '"Supplyra ERP" <no-reply@supplyra.com>',
			to,
			subject: `Slip Gaji Periode ${period}`,
			html
		});
	}

	async sendPasswordReset(to: string, token: string) {
		const appUrl = process.env.APP_URL || 'http://localhost:5173';
		const resetLink = `${appUrl}/auth/reset-password?token=${token}`;
		const html = PasswordResetEmailTemplate(resetLink);

		return await mailer.queueMail({
			from: '"Supplyra ERP" <no-reply@supplyra.com>',
			to,
			subject: 'Permintaan Reset Password',
			html
		});
	}
}
