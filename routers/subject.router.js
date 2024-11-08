const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addSubjects, getAllSubjects, updateSubjects, deleteSubjects } = require('../controllers/subjects.controller')

const router = express.Router()

router.route('/add/subjects').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), addSubjects)
router.route('/all/subjects').get(authMiddleware, roleRestrict('Super Admin', 'Manager'), getAllSubjects)
router.route('/update/subjects').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), updateSubjects)
router.route('/delete/subjects').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), deleteSubjects)

module.exports = router