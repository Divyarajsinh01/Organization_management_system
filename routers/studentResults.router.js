const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addStudentMarks, getStudentMarks, getTop10Students, updateStudentMarks, getStudentsProgressReport } = require('../controllers/studentResults.controller')

const router = express.Router()

router.route('/add/students/test/marks').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), addStudentMarks)
router.route('/get/students/test/marks').post(authMiddleware, getStudentMarks)
router.route('/get/top-10/students').post(authMiddleware, getTop10Students)
router.route('/update/students/test/marks').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), updateStudentMarks)
router.route('/get/students/progress/reports').post(authMiddleware, getStudentsProgressReport)

module.exports = router