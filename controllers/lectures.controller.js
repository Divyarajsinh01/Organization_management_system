const { where, Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { Teacher, Lecture, User, Standard, Subject, Batch } = require("../models");
const { validateTime, validateDuration } = require("../utils/validation");
const ErrorHandler = require("../utils/errorHandler");
const moment = require("moment");

exports.createLectures = catchAsyncError(async (req, res, next) => {
    const { day, start_time, duration, teacher_id, standard_id, batch_id, subject_id } = req.body;

    // Basic validation for required fields
    if (!day || !start_time || !duration || !teacher_id || !standard_id || !batch_id || !subject_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    validateTime(start_time);
    const durationInMinutes = validateDuration(duration);

    // Check if teacher exists
    const teacher = await Teacher.findOne({
        where: { teacher_id }
    });
    if (!teacher) {
        return next(new ErrorHandler('Teacher not found!', 400));
    }

    // Check if teacher is assigned to the specified standard, subject, and batch
    const isTeacherAssignment = await teacher.getTeacherAssignments({
        where: { standard_id, subject_id, batch_id }
    });
    if (isTeacherAssignment.length <= 0) {
        return next(new ErrorHandler('Teacher is not assigned to this subject in batch and standard!', 400));
    }

    // Calculate start and end times for the lecture
    const startTimeOnly = moment(start_time, "hh:mm A").format("HH:mm:ss"); // "14:30:00" (string)
    const endTimeOnly = moment(start_time, "hh:mm A").add(durationInMinutes, "minutes").format("HH:mm:ss"); // "15:30:00" (string)

    // Check for conflicting lectures for the teacher on the same day
    const conflictLecture = await Lecture.findOne({
        where: {
            day,
            batch_id,
            standard_id,
            subject_id,
            teacher_id: { [Op.ne]: teacher_id }, // Exclude the current teacher
            [Op.or]: [
                // Case 1: New lecture starts during an existing lecture
                {
                    start_time: { [Op.lte]: startTimeOnly }, // New lecture starts before or at the same time as existing lecture
                    end_time: { [Op.gt]: startTimeOnly } // Existing lecture ends after the new lecture's start time
                },
                // Case 2: New lecture ends during an existing lecture
                {
                    start_time: { [Op.lt]: endTimeOnly }, // New lecture ends after the existing lecture starts
                    end_time: { [Op.gte]: endTimeOnly } // Existing lecture ends after or at the same time as new lecture's end
                },
                // Case 3: Existing lecture fully within the new lecture time range
                {
                    start_time: { [Op.gte]: startTimeOnly }, // Existing lecture starts after or at the same time as new lecture's start
                    end_time: { [Op.lte]: endTimeOnly } // Existing lecture ends before or at the same time as new lecture's end
                },
                // Case 4: New lecture fully contains an existing lecture
                {
                    start_time: { [Op.lte]: startTimeOnly }, // New lecture starts before or at the same time as existing lecture
                    end_time: { [Op.gte]: endTimeOnly } // New lecture ends after or at the same time as existing lecture
                }
            ]
        }
    });

    if (conflictLecture) {
        return next(new ErrorHandler('Time conflict: Another lecture is already scheduled for this teacher at the specified time.', 409));
    }

    // Create the lecture if no conflict
    const lecture = await Lecture.create({
        day,
        start_time: startTimeOnly,
        end_time: endTimeOnly,
        duration: durationInMinutes,
        teacher_id,
        standard_id,
        batch_id,
        subject_id
    });

    res.status(201).json({
        success: true,
        message: 'Lecture created successfully!',
        data: lecture
    });
});


exports.getLecturesList = catchAsyncError(async (req, res, next) => {
    const { teacher_id, standard_id, batch_id } = req.query;

    const whereClause = {}
    if(teacher_id) whereClause.teacher_id = teacher_id
    if (standard_id) whereClause.standard_id = standard_id
    if (batch_id) whereClause.batch_id = batch_id

    const lectures = await Lecture.findAll({ 
        where: { 
            ...whereClause
        },
        include: [
            {
                model: Teacher,
                as: 'teacher',
                include: [
                    {
                        model: User,
                        attributes: ['name']
                    }
                ]
            },{
                model: Standard,
                as: 'standard'
            },{
                model: Subject,
                as: 'subject'
            },{
                model: Batch,
                as: 'batch'
            }
        ]
    })

    if (lectures.length <= 0) {
        return next(new ErrorHandler('No lectures found for the specified standard and batch.', 400))
    }

    res.status(200).json({
        success: true,
        message: 'Lectures list retrieved successfully!',
        data: lectures
    })
})

// exports.updateLecture = catchAsyncError(async (req, res, next) => {
//     const { id, day, start_time, duration, teacher_id, standard_id, batch_id, subject_id } = req.body;

//     // Basic validation for required fields
//     if (!id || !day || !start_time || !duration || !teacher_id || !standard_id || !batch_id || !subject_id) {
//         return res.status(400).json({ message: 'All fields are required.' });
//     }

//     // Validate start time and duration
//     validateTime(start_time);
//     const durationInMinutes = validateDuration(duration);

//     // Check if the lecture exists
//     const lecture = await Lecture.findOne({ where: { id } });
//     if (!lecture) {
//         return next(new ErrorHandler('Lecture not found!', 404));
//     }

//     // Check if teacher exists
//     const teacher = await Teacher.findOne({ where: { teacher_id } });
//     if (!teacher) {
//         return next(new ErrorHandler('Teacher not found!', 400));
//     }

//     // Check if teacher is assigned to the specified standard, subject, and batch
//     const isTeacherAssignment = await teacher.getTeacherAssignments({
//         where: { standard_id, subject_id, batch_id }
//     });
//     if (isTeacherAssignment.length <= 0) {
//         return next(new ErrorHandler('Teacher is not assigned to this subject in batch and standard!', 400));
//     }

//     // Calculate new start and end times for the updated lecture
//     const startTimeOnly = moment(start_time, "hh:mm A").format("HH:mm:ss");
//     const endTimeOnly = moment(start_time, "hh:mm A").add(durationInMinutes, "minutes").format("HH:mm:ss");

//     // Check if any lecture in the same batch, standard, and day has a time conflict for any teacher (excluding the current teacher if it's an update)
//     const conflictLecture = await Lecture.findOne({
//         where: {
//             day,
//             batch_id, // Same batch
//             standard_id, // Same standard
//             id: { [Op.ne]: id }, // Exclude the current lecture from conflict check
//             [Op.or]: [
//                 {
//                     start_time: { [Op.lte]: startTimeOnly },
//                     end_time: { [Op.gt]: startTimeOnly } // New lecture starts before or during an existing lecture
//                 },
//                 {
//                     start_time: { [Op.lt]: endTimeOnly },
//                     end_time: { [Op.gte]: endTimeOnly } // New lecture ends after or during an existing lecture
//                 },
//                 {
//                     start_time: { [Op.gte]: startTimeOnly },
//                     end_time: { [Op.lte]: endTimeOnly } // New lecture fully contains an existing lecture
//                 },
//                 {
//                     start_time: { [Op.lte]: startTimeOnly },
//                     end_time: { [Op.gte]: endTimeOnly } // Existing lecture fully contains the new lecture
//                 }
//             ]
//         }
//     });

//     if (conflictLecture) {
//         return next(new ErrorHandler('Time conflict: Another lecture is already scheduled for this time in the specified standard and batch.', 409));
//     }

//     // Update the lecture if no conflict
//     lecture.day = day;
//     lecture.start_time = startTimeOnly;
//     lecture.end_time = endTimeOnly;
//     lecture.duration = durationInMinutes;
//     lecture.teacher_id = teacher_id;
//     lecture.standard_id = standard_id;
//     lecture.batch_id = batch_id;
//     lecture.subject_id = subject_id;

//     await lecture.save();

//     res.status(200).json({
//         success: true,
//         message: 'Lecture updated successfully!',
//         data: lecture
//     });
// });
