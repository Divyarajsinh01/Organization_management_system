const express = require('express')
const { loginUser, logoutUser, changePassword, sendForgotPasswordOtp, verifyOTP, resetLoginPassword, updateProfile, updateProfilePic, testPushNotification, saveUserFCMTokens, disableUser, enableUser } = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/authMiddleware')
const { upload } = require('../middlewares/multerMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')

const router = express.Router()

router.route('/login').post(loginUser)
router.route('/logout').post(authMiddleware, logoutUser)
router.route('/change/password').post(authMiddleware, changePassword)
router.route('/forgot-password/send/otp').post(sendForgotPasswordOtp)
router.route('/forgot-password/verify/otp').post(verifyOTP)
router.route('/reset/password').post(resetLoginPassword)
router.route('/update/profile/image').post(authMiddleware,upload.single('profile_image'), updateProfilePic)
router.route('/test/message').get(testPushNotification)
router.route('/set/user/fcm/token').post(authMiddleware, saveUserFCMTokens)
router.route('/disabled/user').post(authMiddleware, roleRestrict(1,2), disableUser)
router.route('/unable/user').post(authMiddleware, roleRestrict(1,2), enableUser)

module.exports = router