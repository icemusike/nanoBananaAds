import postmark from 'postmark';

// Lazy initialization of Postmark client
let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.POSTMARK_API_KEY;
    if (!apiKey) {
      throw new Error('POSTMARK_API_KEY is not configured');
    }
    client = new postmark.ServerClient(apiKey);
  }
  return client;
}

function getFromEmail() {
  return process.env.POSTMARK_FROM_EMAIL || 'noreply@updates.adgeniusai.io';
}

function getAppUrl() {
  return process.env.APP_URL || 'https://nanobananaadfrontend-production.up.railway.app';
}

/**
 * Send welcome email with login credentials
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User's name
 * @param {string} options.email - User's login email
 * @param {string} options.password - Temporary password
 * @param {string} options.productName - Product purchased (e.g., "Starter License")
 * @param {string} options.licenseKey - License key (optional)
 */
export async function sendWelcomeEmail({ to, name, email, password, productName, licenseKey }) {
  try {
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AdGenius AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f7;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0 0 20px 0;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4a4a4a;
      margin: 0 0 20px 0;
    }
    .credentials-box {
      background-color: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .credential-item {
      margin: 15px 0;
    }
    .credential-label {
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .credential-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      font-family: 'Courier New', monospace;
      background-color: #ffffff;
      padding: 10px 15px;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .features-list {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px 25px;
      margin: 25px 0;
    }
    .feature-item {
      padding: 8px 0;
      color: #4a4a4a;
      font-size: 15px;
    }
    .feature-item:before {
      content: "✓ ";
      color: #667eea;
      font-weight: bold;
      margin-right: 8px;
    }
    .warning-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-text {
      font-size: 14px;
      color: #856404;
      margin: 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer-text {
      font-size: 14px;
      color: #6c757d;
      margin: 5px 0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="logo">🎯 AdGenius AI</h1>
    </div>

    <!-- Main Content -->
    <div class="content">
      <h2 class="title">Welcome to AdGenius AI, ${name}! 🎉</h2>

      <p class="text">
        Thank you for purchasing <strong>${productName}</strong>! Your account has been created and is ready to use.
      </p>

      ${licenseKey ? `
      <div class="credentials-box">
        <div class="credential-item">
          <div class="credential-label">License Key</div>
          <div class="credential-value">${licenseKey}</div>
        </div>
      </div>
      ` : ''}

      <p class="text">
        Here are your login credentials to access AdGenius AI:
      </p>

      <!-- Credentials Box -->
      <div class="credentials-box">
        <div class="credential-item">
          <div class="credential-label">Email Address</div>
          <div class="credential-value">${email}</div>
        </div>
        <div class="credential-item">
          <div class="credential-label">Temporary Password</div>
          <div class="credential-value">${password}</div>
        </div>
      </div>

      <div class="warning-box">
        <p class="warning-text">
          <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
        </p>
      </div>

      <center>
        <a href="${getAppUrl()}/login" class="button">Login to AdGenius AI →</a>
      </center>

      <!-- Features -->
      <div class="features-list">
        <div class="feature-item">Generate stunning Facebook ad creatives with AI</div>
        <div class="feature-item">Access powerful copywriting frameworks</div>
        <div class="feature-item">Create unlimited ad variations</div>
        <div class="feature-item">Save and manage your brand library</div>
        <div class="feature-item">Track your ad performance</div>
      </div>

      <p class="text">
        If you have any questions or need assistance, our support team is here to help. Simply reply to this email or visit our support center.
      </p>

      <p class="text">
        Happy creating!<br>
        <strong>The AdGenius AI Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        <strong>AdGenius AI</strong> - AI-Powered Facebook Ad Creation
      </p>
      <p class="footer-text">
        <a href="${getAppUrl()}" class="footer-link">Visit Dashboard</a> •
        <a href="${getAppUrl()}/settings" class="footer-link">Settings</a> •
        <a href="mailto:support@adgeniusai.io" class="footer-link">Support</a>
      </p>
      <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} AdGenius AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const textBody = `
Welcome to AdGenius AI, ${name}!

Thank you for purchasing ${productName}! Your account has been created and is ready to use.

${licenseKey ? `License Key: ${licenseKey}\n` : ''}

Login Credentials:
------------------
Email: ${email}
Password: ${password}

⚠️ IMPORTANT: Please change your password after your first login for security purposes.

Login here: ${getAppUrl()}/login

What's included:
• Generate stunning Facebook ad creatives with AI
• Access powerful copywriting frameworks
• Create unlimited ad variations
• Save and manage your brand library
• Track your ad performance

If you have any questions, just reply to this email.

Happy creating!
The AdGenius AI Team

---
© ${new Date().getFullYear()} AdGenius AI - AI-Powered Facebook Ad Creation
    `;

    const result = await getClient().sendEmail({
      From: getFromEmail(),
      To: to,
      Subject: `Welcome to AdGenius AI - Your Login Credentials`,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: 'outbound'
    });

    console.log('✅ Welcome email sent successfully:', result.MessageID);
    return { success: true, messageId: result.MessageID };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send test email
 * @param {string} to - Recipient email
 */
export async function sendTestEmail(to) {
  try {
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
    .content { padding: 30px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
    .success { color: #28a745; font-weight: bold; font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 AdGenius AI</h1>
      <p>Email Service Test</p>
    </div>
    <div class="content">
      <p class="success">✅ Success!</p>
      <p>Your Postmark email service is configured correctly and working!</p>
      <p><strong>Configuration Details:</strong></p>
      <ul>
        <li>From: ${getFromEmail()}</li>
        <li>Provider: Postmark</li>
        <li>Time: ${new Date().toLocaleString()}</li>
      </ul>
      <p>You can now send transactional emails for:</p>
      <ul>
        <li>Welcome emails with login credentials</li>
        <li>Password reset emails</li>
        <li>Purchase confirmations</li>
        <li>License notifications</li>
      </ul>
    </div>
  </div>
</body>
</html>
    `;

    const result = await getClient().sendEmail({
      From: getFromEmail(),
      To: to,
      Subject: '✅ AdGenius AI - Email Service Test',
      HtmlBody: htmlBody,
      TextBody: `AdGenius AI Email Test\n\n✅ Success! Your Postmark email service is working correctly.\n\nFrom: ${getFromEmail()}\nTime: ${new Date().toLocaleString()}`,
      MessageStream: 'outbound'
    });

    console.log('✅ Test email sent successfully:', result.MessageID);
    return { success: true, messageId: result.MessageID };
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User's name
 * @param {string} options.resetToken - Password reset token
 */
export async function sendPasswordResetEmail({ to, name, resetToken }) {
  const resetUrl = `${getAppUrl()}/reset-password?token=${resetToken}`;

  try {
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin: 0; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🎯 AdGenius AI</h1>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <center>
        <a href="${resetUrl}" class="button">Reset Password →</a>
      </center>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The AdGenius AI Team</p>
    </div>
    <div class="footer">
      <p style="font-size: 12px; color: #6c757d;">© ${new Date().getFullYear()} AdGenius AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await getClient().sendEmail({
      From: getFromEmail(),
      To: to,
      Subject: 'Reset Your AdGenius AI Password',
      HtmlBody: htmlBody,
      TextBody: `Hi ${name},\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour.\n\nThe AdGenius AI Team`,
      MessageStream: 'outbound'
    });

    console.log('✅ Password reset email sent:', result.MessageID);
    return { success: true, messageId: result.MessageID };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendWelcomeEmail,
  sendTestEmail,
  sendPasswordResetEmail
};
