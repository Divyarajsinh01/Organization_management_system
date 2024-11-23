const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { roleRestrict } = require('../middlewares/roleRestrict')
const { addOrganizations, getAllOrganizations, updateOrganization, deleteOrganization } = require('../controllers/organization.controller')
const { upload } = require('../middlewares/multerMiddleware')

const router = express.Router()

router.route('/add/organizations').post(upload.single('logo'), addOrganizations)
router.route('/get/organizations').get(getAllOrganizations)
router.route('/update/organizations').post(upload.single('logo'), updateOrganization)
router.route('/delete/organizations').post(deleteOrganization)

module.exports = router