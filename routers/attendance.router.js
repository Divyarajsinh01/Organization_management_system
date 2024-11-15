const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleRestrict } = require('../middlewares/roleRestrict');
const { createStudentAttendance, getAttendanceList, updateAttendance } = require('../controllers/studentAttendance.controller');

const router = express.Router()

router.route('/fill/students/attendance').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), createStudentAttendance)
router.route('/get/students/attendance/list').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), getAttendanceList)
router.route('/update/students/attendance').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), updateAttendance)

module.exports = router