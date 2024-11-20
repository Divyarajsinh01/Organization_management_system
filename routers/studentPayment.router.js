const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { studentPayFees, getStudentPayFeesList, studentFeesPaymentApproveBySuperAdmin } = require('../controllers/studentFeesPayment.controller')

const router = express.Router()

router.route('/add/student/payment').post(authMiddleware, roleRestrict(1, 2), studentPayFees)
router.route('/students/fees/history').post(authMiddleware, roleRestrict(1, 2), getStudentPayFeesList)
router.route('/student/fees/payment/approve').post(authMiddleware, roleRestrict(1), studentFeesPaymentApproveBySuperAdmin)

module.exports = router