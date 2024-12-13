const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createStudentFeesRecords, getStudentFeesRecordList, getSingleStudentFeesRecord } = require('../controllers/studentFees.controller')

const router = express.Router()

router.route('/create/student/fees/record').post(authMiddleware, roleRestrict(1, 2), createStudentFeesRecords)
router.route('/get/students/fees/record').post(authMiddleware, roleRestrict(1, 2), getStudentFeesRecordList)
router.route('/get/student/fees/record').post(authMiddleware, roleRestrict(1, 2, 3, 4), getSingleStudentFeesRecord)

module.exports = router