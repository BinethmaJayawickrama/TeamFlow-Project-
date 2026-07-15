const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (toEmail, firstName, role) => {
  try {
    // Create reusable transporter object using Gmail SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'teamflow.platform@gmail.com', // Sender Gmail Address
        pass: process.env.EMAIL_PASS || '',                          // App Password
      },
    });

    const roleName = role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Team Collaborator';

    const mailOptions = {
      from: `"TeamFlow Platform" <${process.env.EMAIL_USER || 'teamflow.platform@gmail.com'}>`,
      to: toEmail,
      subject: `Welcome to TeamFlow, ${firstName}! 🚀`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 24px; font-weight: 800; color: #ff3b30; border: 2px solid #ff3b30; padding: 5px 12px; border-radius: 50%;">TF</span>
            <h1 style="color: #0f172a; margin-top: 15px;">Welcome to TeamFlow Workspace</h1>
          </div>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hi ${firstName},</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">Your registration was successful. Welcome to the workspace! You are registered as a <strong>${roleName}</strong>.</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">You can now log in, join project boards, view assignments, and collaborate in real-time.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://team-flow-project-sigma.vercel.app/auth/login" style="background-color: #ff3b30; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">Access Workspace</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated notification. Please do not reply directly to this message.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ REAL EMAIL SENT successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
};
