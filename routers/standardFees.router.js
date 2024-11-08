const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addFeesToStandard, getStandardsFeesList, updateStandardsFees, deleteStandardsFees } = require('../controllers/standardsFees.controller')

const router = express.Router()

router.route('/add/standards/fees').post(authMiddleware, roleRestrict('Super Admin'), addFeesToStandard)
router.route('/standards/fees/list').get(authMiddleware, roleRestrict('Super Admin'), getStandardsFeesList)
router.route('/update/standards/fees').post(authMiddleware, roleRestrict('Super Admin'), updateStandardsFees)
router.route('/delete/standards/fees').post(authMiddleware, roleRestrict('Super Admin'), deleteStandardsFees)

module.exports = router