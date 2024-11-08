const crypto = require('crypto')

exports.generateOTP = (min,max) => {
    const otp = crypto.randomInt(min, max)
    return otp
}