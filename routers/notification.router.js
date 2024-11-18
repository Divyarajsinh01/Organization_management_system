const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { CreateSimpleMessage, getAllNotificationTypes, createMarksMessage, createAttendanceMessage, getNotifications, updateNotifications, addNotificationTypes } = require('../controllers/notification.controller')

const router = express.Router()

router.route('/add/notification/types').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), addNotificationTypes)
router.route('/get/notification/types').get(authMiddleware, getAllNotificationTypes)
router.route('/send/simple/notification').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), CreateSimpleMessage)
router.route('/send/marks/notification').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createMarksMessage)
router.route('/send/attendance/notification').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createAttendanceMessage)
router.route('/get/notification').post(authMiddleware, getNotifications)
router.route('/update/notification').post(authMiddleware, updateNotifications)

module.exports = router