const express = require('express')
const { scheduleTest, getListOfScheduleTest, updateTestsStatus, deleteScheduleTests } = require('../controllers/testSchedule.controller')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')

const router = express.Router()

router.route('/schedule/tests').post(authMiddleware, roleRestrict('Super Admin', 'Manager') , scheduleTest)
router.route('/all/schedule/tests').get(authMiddleware, getListOfScheduleTest)
router.route('/update/schedule/tests').post(authMiddleware, roleRestrict('Super Admin', 'Manager', 'Teacher'), updateTestsStatus)
router.route('/delete/schedule/tests').post(authMiddleware,  roleRestrict('Super Admin', 'Manager'), deleteScheduleTests)

module.exports = router