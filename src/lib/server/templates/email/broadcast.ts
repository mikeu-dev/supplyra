import { EmailLayout } from './layout';

export const BroadcastEmailTemplate = (htmlBody: string, subject: string) => {
	// The body is already HTML, so we just wrap it.
	// But we might want to ensure it looks good inside the container.
	const content = `
        ${htmlBody}
        <br>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 14px; color: #888888; text-align: center;">
            Anda menerima email ini sebagai bagian dari update rutin Supplyra.
            <br>
            <a href="https://supplyra.com/unsubscribe" style="color: #888888; text-decoration: underline;">Berhenti Berlangganan</a>
        </p>
    `;

	return EmailLayout(content, subject);
};
