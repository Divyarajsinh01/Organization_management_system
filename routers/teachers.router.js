const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createTeacher, getTeacherList, getTeacherProfile } = require('../controllers/Teacher.controller')

const router = express.Router()

router.route('/create/teacher').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createTeacher)
router.route('/get/teachers').get(authMiddleware, roleRestrict('Super Admin', 'Manager'), getTeacherList)
router.route('/get/teacher/profile').get(authMiddleware, getTeacherProfile)

module.exports = router