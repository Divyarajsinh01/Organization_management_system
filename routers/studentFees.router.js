const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createStudentFeesRecords } = require('../controllers/studentFees.controller')

const router = express.Router()

router.route('/create/student/fees/record').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createStudentFeesRecords)

module.exports = router