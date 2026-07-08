const nodemailer = require('nodemailer')
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },

});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to mail server:', error);
    } else {
        console.log("Email server is ready to send messages");
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend-ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        })

        console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL : %s', nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('Error sending email : ', error);
    }
}

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\n Thank you for registering at Backend Ledger.We're
    excited to have you on board!\n\nBest regards , \n The Backend Ledger team`;
    const html = `<p>Hello ${name},</p><p>
         Thank you for registering at Backend Ledger.We're
    excited to have you on board!</p><p>Best regards , <br> The Backend Ledger team;</p>`


    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendEmail, sendRegistrationEmail };