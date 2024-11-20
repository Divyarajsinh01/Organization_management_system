const express = require('express')
const { addSuperAdmin, getSuperAdminProfile, updateSuperAdmin, getAllSuperAdmins, deleteSuperAdmin } = require('../controllers/superAdmin.controller')
const { upload } = require('../middlewares/multerMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')

const router = express.Router()

router.route('/add/super-admins').post(upload.single('profile_image'),addSuperAdmin)
router.route('/super-admins/profile').get(authMiddleware ,getSuperAdminProfile)
router.route('/all/super-admins/').get(authMiddleware, getAllSuperAdmins)
router.route('/update/super-admins').post(authMiddleware,  upload.single('profile_image'), updateSuperAdmin)
router.route('/delete/super-admins').delete(authMiddleware, deleteSuperAdmin)

module.exports = router