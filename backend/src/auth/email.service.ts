import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:   this.config.get('MAIL_HOST', 'smtp.gmail.com'),
      port:   Number(this.config.get('MAIL_PORT', '587')),
      secure: this.config.get('MAIL_SECURE', 'false') === 'true',
      auth: {
        user: this.config.get('MAIL_USER', ''),
        pass: this.config.get('MAIL_PASS', ''),
      },
    });
  }

  async sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
    const from = this.config.get('MAIL_FROM', 'AYO Food Delivery <support@ayofood.com>');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f8f1e5;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f1e5;padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:#171717;padding:28px 36px;text-align:center;">
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;background:#C9A45C;border-radius:10px;display:inline-block;text-align:center;line-height:36px;font-weight:900;font-size:18px;color:#171717;">M</div>
                    <span style="color:#ffffff;font-weight:900;font-size:20px;letter-spacing:-0.5px;">AYO <span style="color:#C9A45C;">Food</span></span>
                  </div>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px 36px 28px;">
                  <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111111;">Password Reset</p>
                  <p style="margin:0 0 24px;font-size:14px;color:#777777;line-height:1.6;">
                    Hi <strong style="color:#111111;">${name}</strong>, we received a request to reset your AYO Food Delivery password.
                    Use the code below. It expires in <strong>10 minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <div style="background:#f8f1e5;border:2px solid #C9A45C;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C9A45C;">Your Reset Code</p>
                    <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:16px;color:#111111;font-family:monospace;">${otp}</p>
                  </div>

                  <p style="margin:0 0 20px;font-size:13px;color:#888888;line-height:1.6;">
                    Enter this code on the AYO Food Delivery website to reset your password. If you didn't request this, you can safely ignore this email — your account is secure.
                  </p>

                  <div style="border-top:1px solid #ede3d0;padding-top:20px;margin-top:4px;">
                    <p style="margin:0;font-size:12px;color:#aaaaaa;text-align:center;">
                      © ${new Date().getFullYear()} AYO Food Delivery · Everywhere
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `${otp} is your AYO Food Delivery password reset code`,
        html,
        text: `Your AYO Food Delivery password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
      });
      this.logger.log(`OTP email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${to}: ${(err as any)?.message || err}`);
      throw new Error('Failed to send email. Please try again later.');
    }
  }
}
