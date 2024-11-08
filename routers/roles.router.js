const express = require('express')
const { addRoles, getRoles } = require('../controllers/roles.controller')

const router = express.Router()

router.route('/add/roles').post(addRoles)
router.route('/get/roles').get(getRoles)

module.exports = router