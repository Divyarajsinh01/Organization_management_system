const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        rejectUnauthorized: true
    }
})

const sendEmail = async (email, subject, message) => {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: subject,
        text: message
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail