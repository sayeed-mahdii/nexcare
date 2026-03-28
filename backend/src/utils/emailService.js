const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    console.log('[EMAIL CONFIG] Using:', {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : 'NOT SET'
    });

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, firstName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"NEXCARE Healthcare" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - NEXCARE Healthcare',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">NEXCARE Healthcare</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Trusted Healthcare Partner</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Hello <strong>${firstName || 'User'}</strong>,
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            We received a request to reset your password. Use the OTP below to complete the process:
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
                            <div style="background: #ffffff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #667eea;">${otp}</span>
                            </div>
                            <p style="color: #ef4444; font-size: 13px; margin: 15px 0 0 0;">
                                ⏱️ This OTP expires in <strong>10 minutes</strong>
                            </p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #1f2937; padding: 30px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                            © ${new Date().getFullYear()} NEXCARE Healthcare System. All rights reserved.
                        </p>
                        <p style="color: #6b7280; font-size: 11px; margin: 0;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    return transporter.sendMail(mailOptions);
};

// Verify transporter connection
const verifyEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service is ready');
        return true;
    } catch (error) {
        console.error('❌ Email service error:', error.message);
        return false;
    }
};

// Send Guest Booking OTP Email
const sendGuestOTPEmail = async (email, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"NEXCARE Diagnostics" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code - NEXCARE Diagnostics',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">NEXCARE Diagnostics</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Lab Tests & Health Checkups</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Verification Code</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Use the code below to verify your booking or access your dashboard:
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
                            <div style="background: #ffffff; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; display: inline-block;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #10b981;">${otp}</span>
                            </div>
                            <p style="color: #ef4444; font-size: 13px; margin: 15px 0 0 0;">
                                ⏱️ This OTP expires in <strong>5 minutes</strong>
                            </p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #1f2937; padding: 30px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                            © ${new Date().getFullYear()} NEXCARE Healthcare System. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, verifyEmailConnection, sendGuestOTPEmail };
