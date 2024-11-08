const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createBatches, getListOfStandardWithBatches, updateBatches, deleteBatch } = require('../controllers/batches.controller')

const router = express.Router()

router.route('/create/batches').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), createBatches)
router.route('/all/standards-batches').get(authMiddleware, roleRestrict('Super Admin', 'Manager'), getListOfStandardWithBatches)
router.route('/update/batches').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), updateBatches)
router.route('/delete/batches').post(authMiddleware, roleRestrict('Super Admin', 'Manager'), deleteBatch)

module.exports = router