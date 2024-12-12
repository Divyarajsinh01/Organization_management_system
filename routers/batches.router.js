const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createBatches, getListOfStandardWithBatches, updateBatches, deleteBatch } = require('../controllers/batches.controller')

const router = express.Router()

router.route('/create/batches').post(authMiddleware, roleRestrict(1,2), createBatches)
router.route('/all/standards-batches').get(authMiddleware, roleRestrict(1,2, 3, 4), getListOfStandardWithBatches)
router.route('/update/batches').post(authMiddleware, roleRestrict(1,2), updateBatches)
router.route('/delete/batches').post(authMiddleware, roleRestrict(1,2), deleteBatch)

module.exports = router