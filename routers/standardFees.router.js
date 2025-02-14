const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addFeesToStandard, getStandardsFeesList, updateStandardsFees, deleteStandardsFees } = require('../controllers/standardsFees.controller')

const router = express.Router()

router.route('/add/standards/fees').post(authMiddleware, roleRestrict(1,2), addFeesToStandard)
router.route('/standards/fees/list').post(authMiddleware, roleRestrict(1, 2,3,4), getStandardsFeesList)
router.route('/update/standards/fees').post(authMiddleware, roleRestrict(1,2), updateStandardsFees)
router.route('/delete/standards/fees').post(authMiddleware, roleRestrict(1,2), deleteStandardsFees)

module.exports = router