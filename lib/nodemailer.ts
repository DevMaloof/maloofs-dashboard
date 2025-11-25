import nodemailer from 'nodemailer';

// Create transporter with your Gmail credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Verify transporter configuration
transporter.verify((error: any) => {
    if (error) {
        console.error('❌ Nodemailer configuration error:', error);
    } else {
        console.log('✅ Nodemailer is ready to send emails');
    }
});

export default transporter;