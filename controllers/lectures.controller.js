const { where, Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { Teacher, Lecture, User, Standard, Subject, Batch, Sequelize } = require("../models");
const { validateTime, validateDuration } = require("../utils/validation");
const ErrorHandler = require("../utils/errorHandler");
const moment = require("moment");

exports.createLectures = catchAsyncError(async (req, res, next) => {
    const { day, start_time, end_time, teacher_id, standard_id, batch_id, subject_id } = req.body;

    // Basic validation for required fields
    if (!day || !start_time || !end_time || !teacher_id || !standard_id || !batch_id || !subject_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    validateTime(start_time);
    validateTime(end_time)
    // const durationInMinutes = validateDuration(duration);

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
    const endTimeOnly = moment(end_time, "hh:mm A").format("HH:mm:ss"); // "15:30:00" (string)
    // const endTimeOnly = moment(start_time, "hh:mm A").add(durationInMinutes, "minutes").format("HH:mm:ss"); // "15:30:00" (string)

    // Check for conflicting lectures for the teacher on the same day
    // const conflictLecture = await Lecture.findOne({
    //     where: {
    //         day,
    //         batch_id,
    //         standard_id,
    //         subject_id,
    //         teacher_id: { [Op.ne]: teacher_id }, // Exclude the current teacher
    //         [Op.or]: [
    //             // Case 1: New lecture starts during an existing lecture
    //             {
    //                 start_time: { [Op.lte]: startTimeOnly }, // New lecture starts before or at the same time as existing lecture
    //                 end_time: { [Op.gt]: startTimeOnly } // Existing lecture ends after the new lecture's start time
    //             },
    //             // Case 2: New lecture ends during an existing lecture
    //             {
    //                 start_time: { [Op.lt]: endTimeOnly }, // New lecture ends after the existing lecture starts
    //                 end_time: { [Op.gte]: endTimeOnly } // Existing lecture ends after or at the same time as new lecture's end
    //             },
    //             // Case 3: Existing lecture fully within the new lecture time range
    //             {
    //                 start_time: { [Op.gte]: startTimeOnly }, // Existing lecture starts after or at the same time as new lecture's start
    //                 end_time: { [Op.lte]: endTimeOnly } // Existing lecture ends before or at the same time as new lecture's end
    //             },
    //             // Case 4: New lecture fully contains an existing lecture
    //             {
    //                 start_time: { [Op.lte]: startTimeOnly }, // New lecture starts before or at the same time as existing lecture
    //                 end_time: { [Op.gte]: endTimeOnly } // New lecture ends after or at the same time as existing lecture
    //             }
    //         ]
    //     }
    // });

    // Check for conflicts
    const conflictLecture = await Lecture.findOne({
        where: {
            day, // Check for the same day
            [Op.or]: [
                // Case 1: Same teacher conflict
                {
                    teacher_id, // Same teacher
                    [Op.or]: [
                        // Overlapping lecture conditions
                        {
                            start_time: { [Op.lte]: startTimeOnly },
                            end_time: { [Op.gt]: startTimeOnly }
                        },
                        {
                            start_time: { [Op.lt]: endTimeOnly },
                            end_time: { [Op.gte]: endTimeOnly }
                        },
                        {
                            start_time: { [Op.gte]: startTimeOnly },
                            end_time: { [Op.lte]: endTimeOnly }
                        }
                    ]
                },
                // Case 2: Other teachers' conflicts for the same standard, batch, and subject
                {
                    standard_id,
                    batch_id,
                    subject_id,
                    [Op.or]: [
                        {
                            start_time: { [Op.lte]: startTimeOnly },
                            end_time: { [Op.gt]: startTimeOnly }
                        },
                        {
                            start_time: { [Op.lt]: endTimeOnly },
                            end_time: { [Op.gte]: endTimeOnly }
                        },
                        {
                            start_time: { [Op.gte]: startTimeOnly },
                            end_time: { [Op.lte]: endTimeOnly }
                        }
                    ]
                }
            ]
        }
    });


    if (conflictLecture) {
        return next(new ErrorHandler('Time conflict: Another lecture is already scheduled for this teacher at the specified time.', 400));
    }

    // Create the lecture if no conflict
    const lecture = await Lecture.create({
        day,
        start_time: startTimeOnly,
        end_time: endTimeOnly,
        // duration: durationInMinutes,
        teacher_id,
        standard_id,
        batch_id,
        subject_id
    });

    res.status(200).json({
        success: true,
        message: 'Lecture created successfully!',
        data: lecture
    });
});


exports.getLecturesList = catchAsyncError(async (req, res, next) => {
    const { teacher_id, standard_id, batch_id, day } = req.body;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const whereClause = {}
    if (teacher_id) whereClause.teacher_id = teacher_id
    if (standard_id) whereClause.standard_id = standard_id
    if (batch_id) whereClause.batch_id = batch_id
    if (day) {
        const isDay = daysOfWeek.includes(day)
        if (!isDay) {
            return next(new ErrorHandler('Invalid day of the week', 400))
        }
        whereClause.day = day
    }

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
            }, {
                model: Standard,
                as: 'standard'
            }, {
                model: Subject,
                as: 'subject'
            }, {
                model: Batch,
                as: 'batch'
            }
        ],
        // group: ['day']
    })

    if (lectures.length <= 0) {
        return next(new ErrorHandler('No lectures found for the specified standard and batch.', 400))
    }

    // Group lectures by day
    const groupedLectures = lectures.reduce((acc, lecture) => {
        const day = lecture.day; // Assuming each lecture has a 'day' property

        // If the day doesn't exist in the accumulator, create an empty array for lectures
        if (!acc[day]) {
            acc[day] = [];
        }

        // Add the current lecture to the list for that day
        acc[day].push(lecture);

        return acc;
    }, {});

    // Convert the grouped lectures into the desired structure: [{ day: 'Monday', lectures: [...] }, ...]
    const result = daysOfWeek.map(day => ({
        day,
        lectures: groupedLectures[day] || []  // If no lectures for that day, return an empty array
    }));

    res.status(200).json({
        success: true,
        message: 'Lectures list retrieved successfully!',
        data: result
    })
})

exports.updateLecture = catchAsyncError(async (req, res, next) => {
    const { lecture_id, day, start_time, end_time, teacher_id, standard_id, batch_id, subject_id } = req.body;

    // Basic validation for required fields
    if (!lecture_id) {
        return next(new ErrorHandler('Lecture id is required.', 400));
    }

    // Check if the lecture exists
    const lecture = await Lecture.findOne({ where: { lecture_id } });
    if (!lecture) {
        return next(new ErrorHandler('Lecture not found!', 404));
    }

    const updateFields = {}
    if(day) updateFields.day = day
    if(start_time) {
        validateTime(start_time)
        updateFields.start_time = moment(start_time, "hh:mm A").format("HH:mm:ss")
    }
    if(end_time) {
        validateTime(end_time)
        updateFields.end_time = moment(end_time, "hh:mm A").format("HH:mm:ss")
    }

    if(standard_id) updateFields.standard_id = standard_id
    if(subject_id) updateFields.subject_id = subject_id
    if(batch_id) updateFields.batch_id = batch_id
    if(teacher_id) updateFields.teacher_id = teacher_id

    // Prepare conflict check fields
    const conflictDay = updateFields.day || lecture.day;
    const conflictStartTime = updateFields.start_time || lecture.start_time;
    const conflictEndTime = updateFields.end_time || lecture.end_time;
    const conflictTeacherId = teacher_id || lecture.teacher_id;
    const conflictStandardId = standard_id || lecture.standard_id;
    const conflictBatchId = batch_id || lecture.batch_id;
    const conflictSubjectId = subject_id || lecture.subject_id;

    // Check if teacher exists
    const teacher = await Teacher.findOne({ where: { teacher_id: conflictTeacherId } });
    if (!teacher) {
        return next(new ErrorHandler('Teacher not found!', 400));
    }

    // Check if teacher is assigned to the specified standard, subject, and batch
    const isTeacherAssignment = await teacher.getTeacherAssignments({
        where: { standard_id: conflictStandardId, subject_id: conflictSubjectId, batch_id: conflictBatchId }
    });
    if (isTeacherAssignment.length <= 0) {
        return next(new ErrorHandler('Teacher is not assigned to this subject in batch and standard!', 400));
    }

    // Check if any lecture in the same batch, standard, and day has a time conflict for any teacher (excluding the current teacher if it's an update)
    const conflictLecture = await Lecture.findOne({
        where: {
            day: conflictDay,
            lecture_id: { [Op.ne]: lecture_id }, // Exclude the current lecture from conflict check
            [Op.or]: [
                // Overlapping lecture conditions for teacher
                {
                    teacher_id: conflictTeacherId,
                    [Op.or]: [
                        {
                            start_time: { [Op.lte]: conflictStartTime },
                            end_time: { [Op.gt]: conflictStartTime }
                        },
                        {
                            start_time: { [Op.lt]: conflictEndTime },
                            end_time: { [Op.gte]: conflictEndTime }
                        },
                        {
                            start_time: { [Op.gte]: conflictStartTime },
                            end_time: { [Op.lte]: conflictEndTime }
                        }
                    ]
                },
                // Case 2: Other teachers' conflicts for the same standard, batch, and subject
                {
                    standard_id: conflictStandardId,
                    batch_id: conflictBatchId,
                    subject_id: conflictSubjectId,
                    [Op.or]: [
                        {
                            start_time: { [Op.lte]: conflictStartTime },
                            end_time: { [Op.gt]: conflictStartTime }
                        },
                        {
                            start_time: { [Op.lt]: conflictEndTime },
                            end_time: { [Op.gte]: conflictEndTime }
                        },
                        {
                            start_time: { [Op.gte]: conflictStartTime },
                            end_time: { [Op.lte]: conflictEndTime }
                        }
                    ]
                }
            ]
        }
    });

    if (conflictLecture) {
        return next(new ErrorHandler('Time conflict: Another lecture is already scheduled for this time in the specified standard and batch.', 409));
    }

    await lecture.update(updateFields);

    res.status(200).json({
        success: true,
        message: 'Lecture updated successfully!',
        data: lecture
    });
});

// delete lecture 

exports.deleteLecture = catchAsyncError(async (req, res, next) => {
    const { lecture_id } = req.body;

    if (!lecture_id) {
        return next(new ErrorHandler('Please provide a valid lecture id', 400));
    }

    const isLecture = await Lecture.findOne({
        where: { lecture_id }
    })

    if (!isLecture) {
        return next(new ErrorHandler('No lecture available', 400))
    }

    await isLecture.destroy()

    res.status(200).json({
        success: true,
        message: 'Lecture deleted successfully!'
    })
})