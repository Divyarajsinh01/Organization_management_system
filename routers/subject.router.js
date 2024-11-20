const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addSubjects, getAllSubjects, updateSubjects, deleteSubjects } = require('../controllers/subjects.controller')

const router = express.Router()

router.route('/add/subjects').post(authMiddleware, roleRestrict(1,2), addSubjects)
router.route('/all/subjects').get(authMiddleware, roleRestrict(1,2), getAllSubjects)
router.route('/update/subjects').post(authMiddleware, roleRestrict(1,2), updateSubjects)
router.route('/delete/subjects').post(authMiddleware, roleRestrict(1,2), deleteSubjects)

module.exports = router