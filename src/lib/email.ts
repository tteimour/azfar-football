// Email utility functions for sending match reminders
// This module uses nodemailer for sending emails

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

interface MatchReminderData {
  to: string;
  playerName: string;
  matchTitle: string;
  stadiumName: string;
  stadiumAddress?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomUrl: string;
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    user,
    pass,
    from,
  };
}

export async function sendMatchReminder(data: MatchReminderData): Promise<boolean> {
  const config = getEmailConfig();

  if (!config) {
    console.warn('Email not configured. Skipping email send.');
    return false;
  }

  try {
    // Dynamic import to avoid issues with edge runtime
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #1a1a2e; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #16213e; border-radius: 12px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 60px; height: 60px; background-color: #00A651; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
          h1 { color: #00A651; margin: 15px 0; }
          .details { background-color: #1a1a2e; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 12px; }
          .detail-label { color: #888; width: 100px; }
          .detail-value { color: #fff; }
          .button { display: inline-block; background-color: #00A651; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">T</div>
            <h1>Match Reminder</h1>
            <p>Your football match is starting soon!</p>
          </div>

          <p>Hi ${data.playerName},</p>
          <p>This is a friendly reminder that your football match is starting in about 2 hours.</p>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Match:</span>
              <span class="detail-value">${data.matchTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stadium:</span>
              <span class="detail-value">${data.stadiumName}</span>
            </div>
            ${data.stadiumAddress ? `
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.stadiumAddress}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.startTime} - ${data.endTime}</span>
            </div>
          </div>

          <center>
            <a href="${data.roomUrl}" class="button">View Match Details</a>
          </center>

          <div class="footer">
            <p>See you on the field!</p>
            <p>Tapadam Football</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Tapadam Football" <${config.from}>`,
      to: data.to,
      subject: `Reminder: ${data.matchTitle} starts in 2 hours`,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${data.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}
