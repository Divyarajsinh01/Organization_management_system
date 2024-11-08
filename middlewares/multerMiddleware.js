const multer = require('multer');
const ErrorHandler = require('../utils/errorHandler');

// const storage = multer.memoryStorage()
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits : {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)/)) {
            return cb(new ErrorHandler('please upload an image (jpg, png, jpeg)'))
        }
        cb(undefined, true)
    }
});


module.exports = {upload};