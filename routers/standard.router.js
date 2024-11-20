const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addStandard, getAllStandardWithAssociatedSubjects, updateStandard, deleteStandard } = require('../controllers/standards.controller')

const router = express.Router()

router.route('/add/standards').post(authMiddleware, roleRestrict(1,2), addStandard)
router.route('/all/standards').get(authMiddleware,  roleRestrict(1,2), getAllStandardWithAssociatedSubjects)
router.route('/update/standards').post(authMiddleware, roleRestrict(1,2), updateStandard)
router.route('/delete/standards').post(authMiddleware, roleRestrict(1,2), deleteStandard)

module.exports = router