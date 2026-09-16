import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (to, subject, text, html) => {
    if (!to || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email not sent: missing SMTP configuration');
        return null;
    }

    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        text,
        html,
    });
    return response;
};

export default sendEmail;
