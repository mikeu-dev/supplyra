import { EmailLayout } from './layout';

export const PayslipEmailTemplate = (name: string, period: string, amount: string) => {
	const formattedAmount = Number(amount).toLocaleString('id-ID');
	const content = `
        <h2>Slip Gaji Karyawan</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Berikut adalah rincian gaji Anda untuk periode <strong>${period}</strong>:</p>
        
        <table class="table" style="width: 100%; margin: 20px 0; border: 1px solid #eeeeee;">
            <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #eeeeee;">Keterangan</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eeeeee;">Nilai</th>
            </tr>
            <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #eeeeee;">Total Diterima (Take Home Pay)</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #2563eb;">Rp ${formattedAmount}</td>
            </tr>
        </table>

        <p>Detail lengkap komponen gaji (gaji pokok, tunjangan, potongan, lembur, dll) dapat dilihat dan diunduh melalui aplikasi panel karyawan.</p>
        <br>
        <a href="https://supplyra.com/panel/employee/payslips" class="button" style="color: #ffffff;">Lihat Detail di Aplikasi</a>
        <br><br>
        <p>Terima kasih atas kerja keras dan dedikasi Anda.</p>
    `;

	return EmailLayout(content, `Slip Gaji ${period}`);
};
