const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addStandard, getAllStandardWithAssociatedSubjects, updateStandard, deleteStandard } = require('../controllers/standards.controller')

const router = express.Router()

router.route('/add/standards').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), addStandard)
router.route('/all/standards').get(authMiddleware,  roleRestrict('Super Admin', 'Manager'), getAllStandardWithAssociatedSubjects)
router.route('/update/standards').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), updateStandard)
router.route('/delete/standards').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), deleteStandard)

module.exports = router