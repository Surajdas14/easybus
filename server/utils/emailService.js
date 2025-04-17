const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // For port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // For self-signed certificates
  },
  debug: true, // Always enable debug logs to help diagnose issues
  logger: true // Always enable logger to help diagnose issues
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
    console.error('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Generate cryptographically secure OTP
const generateOTP = () => {
  // Generate 6 random bytes and convert to a 6-digit number
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  return (num % 900000 + 100000).toString();
};

// Rate limiting for OTP requests (simple in-memory implementation)
const otpRequests = new Map();
const OTP_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_REQUESTS = 10; // Maximum 10 OTPs per email per 5 minutes

const canSendOTP = (email) => {
  const now = Date.now();
  const userRequests = otpRequests.get(email) || [];
  
  // Remove requests older than window period
  const recentRequests = userRequests.filter(time => now - time < OTP_WINDOW);
  
  if (recentRequests.length >= MAX_OTP_REQUESTS) {
    console.log(`Rate limit exceeded for ${email}. Recent requests:`, recentRequests.length);
    return false;
  }
  
  // Update requests
  recentRequests.push(now);
  otpRequests.set(email, recentRequests);
  console.log(`OTP request allowed for ${email}. Total recent requests:`, recentRequests.length);
  return true;
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // Check rate limiting
    if (!canSendOTP(email)) {
      console.error(`Rate limit exceeded for ${email}. Please try again in 5 minutes.`);
      throw new Error('Too many OTP requests. Please try again in 5 minutes.');
    }

    console.log('Attempting to send email to:', email);
    
    const mailOptions = {
      from: {
        name: 'EasyBus',
        address: process.env.EMAIL_FROM
      },
      to: email,
      subject: 'Email Verification - EasyBus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a73e8; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">EasyBus</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; margin-top: 20px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for registering with EasyBus. To complete your registration, please use the following verification code:
            </p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h2 style="color: #1a73e8; letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p style="color: #666; line-height: 1.6;">
              This verification code will expire in 10 minutes for security reasons. If you didn't request this code, please ignore this email.
            </p>
            <div style="margin-top: 20px; padding: 15px; background-color: #fff8e1; border-radius: 5px;">
              <p style="color: #b71c1c; margin: 0;">
                <strong>Security Notice:</strong> Never share this code with anyone. EasyBus will never ask for this code through any other means.
              </p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} EasyBus. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
