export const EmailLayout = (content: string, title: string = 'Supplyra Solutions') => {
	const currentYear = new Date().getFullYear();

	return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #2563eb; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1a1a1a; font-size: 20px; margin-top: 0; }
        .content p { line-height: 1.6; color: #555555; font-size: 16px; margin-bottom: 20px; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #888888; border-top: 1px solid #eeeeee; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 12px; border-bottom: 1px solid #eeeeee; text-align: left; }
        .table th { background-color: #f9fafb; font-weight: 600; }
        @media only screen and (max-width: 600px) {
            .container { width: 100%; border-radius: 0; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div style="padding: 40px 0;">
        <div class="container">
            <div class="header">
                <h1>Supplyra Solutions</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${currentYear} Supplyra Solutions. All rights reserved.</p>
                <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};
