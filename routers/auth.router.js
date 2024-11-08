const express = require('express')
const { loginUser, logoutUser, changePassword, sendForgotPasswordOtp, verifyOTP, resetLoginPassword } = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

router.route('/login').post(loginUser)
router.route('/logout').post(authMiddleware, logoutUser)
router.route('/change/password').post(authMiddleware, changePassword)
router.route('/forgot-password/send/otp').post(sendForgotPasswordOtp)
router.route('/forgot-password/verify/otp').post(verifyOTP)
router.route('/reset/password').post(resetLoginPassword)

module.exports = router