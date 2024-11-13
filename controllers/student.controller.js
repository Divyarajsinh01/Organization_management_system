const catchAsyncError = require("../middlewares/catchAsyncError");
const { User } = require('../models')

exports.createStudents = catchAsyncError(async (req, res, next) => {
    const { name, email, mobileNo, address, role_id, standard_id, batch_id, organization_id } = req.body;

    if (!name || !email || !mobileNo || !address || !role_id || role_id === null || !standard_id || !batch_id || !organization_id) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const isUser = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { mobileNo }
            ]
        }
    })
})