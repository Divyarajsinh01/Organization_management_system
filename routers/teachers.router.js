const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createTeacher, getTeacherList, getTeacherProfile } = require('../controllers/Teacher.controller')

const router = express.Router()

router.route('/create/teacher').post(authMiddleware, roleRestrict(1,2), createTeacher)
router.route('/get/teachers').get(authMiddleware, roleRestrict(1,2), getTeacherList)
router.route('/get/teacher/profile').get(authMiddleware, getTeacherProfile)

module.exports = router