const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { createLectures, getLecturesList, deleteLecture, updateLecture } = require('../controllers/lectures.controller')
const { roleRestrict } = require('../middlewares/roleRestrict')

const router =  express.Router()

router.route('/create/lectures').post(authMiddleware,roleRestrict(1,2), createLectures)
router.route('/get/lectures').post(authMiddleware, getLecturesList)
router.route('/delete/lecture').post(authMiddleware, roleRestrict(1,2), deleteLecture)
router.route('/update/lecture').post(authMiddleware, roleRestrict(1,2), updateLecture)

module.exports = router
