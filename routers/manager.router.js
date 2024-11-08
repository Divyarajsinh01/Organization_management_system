const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { createManagerBySuperAdmin, getAllManagerBySuperAdmin, getManagerProfile, managerUpdateProfile, deleteManagers } = require('../controllers/manager.controller')
const { upload } = require('../middlewares/multerMiddleware')

const router = express.Router()

router.route('/add/managers').post(authMiddleware, roleRestrict('Super Admin'), createManagerBySuperAdmin)
router.route('/all/managers').get(authMiddleware,  roleRestrict('Super Admin'), getAllManagerBySuperAdmin)
router.route('/managers/profile').get(authMiddleware, roleRestrict('Manager'), getManagerProfile)
router.route('/update/managers').post(authMiddleware,  roleRestrict('Manager'),upload.single('profile_image'), managerUpdateProfile)
router.route('/delete/managers').post(authMiddleware, roleRestrict('Super Admin'), deleteManagers)

module.exports = router