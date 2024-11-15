const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createHoliday, getHolidays, updateHoliday, deleteHoliday } = require('../controllers/holiday.controller')

const router = express.Router()

router.route('/create/holiday').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createHoliday)
router.route('/get/holidays').get(authMiddleware, getHolidays)
router.route('/update/holiday').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), updateHoliday)
router.route('/delete/holiday').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), deleteHoliday)

module.exports = router