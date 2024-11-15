const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createStudents, getStudentProfile, getStudentList } = require('../controllers/student.controller')

const router = express.Router()

router.route('/create/student').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createStudents)
router.route('/get/student/profile').get(authMiddleware, getStudentProfile)
router.route('/get/students/list').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), getStudentList)

module.exports = router