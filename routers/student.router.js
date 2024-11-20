const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createStudents, getStudentProfile, getStudentList, updateStudents } = require('../controllers/student.controller')

const router = express.Router()

router.route('/create/student').post(authMiddleware, roleRestrict(1,2), createStudents)
router.route('/get/student/profile').get(authMiddleware, getStudentProfile)
router.route('/get/students/list').post(authMiddleware, roleRestrict(1,2,3), getStudentList)
router.route('/update/student').post(authMiddleware, (roleRestrict(1,2,3)), updateStudents)

module.exports = router