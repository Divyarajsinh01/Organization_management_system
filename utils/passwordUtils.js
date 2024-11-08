const bcrypt = require('bcryptjs')

const hashPassword  = async (pass) => {
    try {
        const encryptPass = await bcrypt.hash(pass, 8)

        return encryptPass
    } catch (error) {
        throw error
    }
}

const verifyHashPassword  = async (pass, hashPass) => {
    try {
        const verifyPass = bcrypt.compare(pass, hashPass)
        return verifyPass
    } catch (error) {
        throw error
    }
}

module.exports = { hashPassword , verifyHashPassword }