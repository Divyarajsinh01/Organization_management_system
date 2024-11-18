const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createStudentFeesRecords, getStudentFeesRecordList } = require('../controllers/studentFees.controller')

const router = express.Router()

router.route('/create/student/fees/record').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createStudentFeesRecords)
router.route('/get/students/fees/record').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), getStudentFeesRecordList)

module.exports = router