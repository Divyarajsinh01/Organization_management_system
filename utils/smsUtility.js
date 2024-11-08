const twilio = require('twilio');
const ErrorHandler = require('./errorHandler');

const accountSid = process.env.TWILLO_ACCOUNT_SID
const authToken = process.env.TWILLO_AUTH_TOKEN

const client = twilio(accountSid, authToken);

exports.sendOTP = async(otp, number) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILLO_NUMBER,
            to: `${number}`
        })

        // console.log(message.body)

        return message
    } catch (error) {
        // console.log(error.message)
        throw new ErrorHandler(error.message, 400)
    }
}