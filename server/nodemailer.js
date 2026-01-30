import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,
    secure:false,
    auth: {     
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls:{
        rejectUnauthorized: false,
    },
});
export default transporter;
