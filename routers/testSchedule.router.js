const express = require('express')
const { scheduleTest, getListOfScheduleTest, updateTestsStatus, deleteScheduleTests } = require('../controllers/testSchedule.controller')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')

const router = express.Router()

router.route('/schedule/tests').post(authMiddleware, roleRestrict(1,2) , scheduleTest)
router.route('/all/schedule/tests').post(authMiddleware, getListOfScheduleTest)
router.route('/update/schedule/tests').post(authMiddleware, roleRestrict(1,2,3), updateTestsStatus)
router.route('/delete/schedule/tests').post(authMiddleware,  roleRestrict(1, 2), deleteScheduleTests)

module.exports = router