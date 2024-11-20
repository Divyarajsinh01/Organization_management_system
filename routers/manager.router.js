const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createManagerBySuperAdmin, getAllManagerBySuperAdmin, getManagerProfile, managerUpdateProfile, deleteManagers } = require('../controllers/manager.controller')
const { upload } = require('../middlewares/multerMiddleware')

const router = express.Router()

router.route('/add/managers').post(authMiddleware, roleRestrict(1), createManagerBySuperAdmin)
router.route('/all/managers').get(authMiddleware,  roleRestrict(1), getAllManagerBySuperAdmin)
router.route('/managers/profile').get(authMiddleware, getManagerProfile)
router.route('/update/managers').post(authMiddleware, upload.single('profile_image'), managerUpdateProfile)
router.route('/delete/managers').post(authMiddleware, roleRestrict(1), deleteManagers)

module.exports = router