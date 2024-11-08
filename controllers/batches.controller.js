const {Op} = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require('../models/index')
const Batch = db.Batch
const Standard = db.Standard
const ErrorHandler = require("../utils/errorHandler");

exports.createBatches = catchAsyncError(async (req, res, next) => {
    const { batch_name, batch_time, standard_id } = req.body

    const isStandard =  await Standard.findByPk(standard_id)
    if(!isStandard) {
        return next(new ErrorHandler('No standard found!', 400))
    }

    const isBatchExist = await Batch.findOne({
        where:{
            batch_name,
            standard_id
        }
    })

    if(isBatchExist) {
        return next(new ErrorHandler('A batch with this name already exists for the selected standard.!', 400))
    }

    const newBatch = await Batch.create({
        batch_name,
        batch_time,
        standard_id
    })

    res.status(200).json({
        success: true,
        message: 'Batch created successfully!',
        data: newBatch
    })
})

exports.getListOfStandardWithBatches = catchAsyncError(async (req, res, next) => {
    const standards = await Standard.findAll({
        include: {
            model: Batch,
            as: 'batches',
            attributes: ['batch_id', 'batch_name', 'batch_time'],
            required: true,
        }
    });

    if (standards.length <= 0) {
        return next(new ErrorHandler('No batches available for standards!', 400));
    }

    res.status(200).json({
        success: true,
        message: 'Standards with batches retrieved successfully!',
        data: standards,
    });
});

exports.updateBatches = catchAsyncError(async (req, res, next) => {
    const { batch_id, batch_name, batch_time } = req.body;

    const isBatch = await Batch.findOne({where: {batch_id}})
    if(!isBatch){
        return next(new ErrorHandler('Batch not found!', 400))
    }

    // Check if another batch with the same name exists for the same standard
    const batchExists = await Batch.findOne({
        where: {
            batch_name,
            standard_id: isBatch.standard_id, // Use the standard ID of the current batch
            batch_id: { [Op.ne]: batch_id } // Exclude the current batch
        }
    });

    if (batchExists) {
        return next(new ErrorHandler('A batch with this name already exists for the selected standard!', 400));
    }


    await isBatch.update({
         batch_name,
         batch_time
    })

    res.status(200).json({
        success: true,
        message: 'Batch updated successfully!',
        data: isBatch,
    })
})

exports.deleteBatch = catchAsyncError(async (req, res, next) => {
    const {batch_id} = req.body
    const isBatch = await Batch.findOne({where: {batch_id}})

    if(!isBatch){
        return next(new ErrorHandler('No batch found!', 400))
    }

    await isBatch.destroy()

    res.status(200).json({
        success: true,
        message: 'Batch deleted successfully!'
    })
})