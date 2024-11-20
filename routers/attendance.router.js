const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleRestrict } = require('../middlewares/roleRestrict');
const { createStudentAttendance, getAttendanceList, updateAttendance, getLoginStudentAttendance } = require('../controllers/studentAttendance.controller');

const router = express.Router()

router.route('/fill/students/attendance').post(authMiddleware, roleRestrict(1,2,3), createStudentAttendance)
router.route('/get/students/attendance/list').post(authMiddleware,roleRestrict(1,2,3), getAttendanceList)
router.route('/update/students/attendance').post(authMiddleware, roleRestrict(1,2,3), updateAttendance)
router.route('/students/attendance').post(authMiddleware, getLoginStudentAttendance)

module.exports = router