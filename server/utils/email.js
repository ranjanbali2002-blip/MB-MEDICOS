const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function sendOtpEmail(toEmail, otp, name) {
  const mailOptions = {
    from: `"MB-Medicos" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your MB-Medicos Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); width: 56px; height: 56px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: 900;">M</span>
          </div>
          <h2 style="color: #1e293b; margin: 12px 0 4px;">MB-Medicos</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Email Verification</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e2e8f0;">
          <p style="color: #475569; font-size: 15px; margin-bottom: 20px;">
            Hi <strong>${name}</strong>! Use this OTP to verify your email:
          </p>
          <div style="background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 20px; letter-spacing: 12px; font-size: 36px; font-weight: 900; color: #0ea5e9;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
            This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
          </p>
        </div>

        <p style="text-align: center; color: #cbd5e1; font-size: 12px; margin-top: 20px;">
          If you didn't sign up for MB-Medicos, ignore this email.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

module.exports = { sendOtpEmail }
