const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { createLectures, getLecturesList } = require('../controllers/lectures.controller')
const { roleRestrict } = require('../middlewares/roleRestrict')

const router =  express.Router()

router.route('/create/lectures').post(authMiddleware,roleRestrict('Super Admin', 'Manager'), createLectures)
router.route('/get/lectures').get(authMiddleware, getLecturesList)

module.exports = router
