const sequelize = require('../config/dbConnect');
const { Sequelize } = require('sequelize');
const userFCMModel = require('./userFCM.model');

const db = {}

db.sequelize = sequelize
db.Sequelize = Sequelize

db.User = require('./user.model')(sequelize, Sequelize)
db.UserRole = require('./role.model')(sequelize, Sequelize)
db.LoginToken = require('./loginToken.model')(sequelize, Sequelize)
db.Manager = require('./manager.model')(sequelize, Sequelize)
db.Subject = require('./subjects.model')(sequelize, Sequelize)
db.Standard = require('./standards.model')(sequelize, Sequelize)
// db.standardSubjects = require('./standardSubjects.model')(sequelize, Sequelize)
db.Batch = require('./batch.model')(sequelize, Sequelize)
db.Organization = require('./organization.model')(sequelize, Sequelize)
db.StandardFees = require('./standardsFees.model')(sequelize, Sequelize)
db.Test = require('./testSchedule.model')(sequelize, Sequelize)
db.Teacher = require('./teacher.model')(sequelize, Sequelize)
db.TeacherAssignment = require('./teacherAssignment.model')(sequelize, Sequelize)
db.Lecture = require('./lecture.model')(sequelize, Sequelize)
db.Student = require('./student.model')(sequelize, Sequelize)
db.StudentResult = require('./studentResult.model')(sequelize, Sequelize)
db.Holiday = require('./holidays.model')(sequelize, Sequelize)
db.StudentAttendance = require('./attendance.model')(sequelize, Sequelize)
db.StudentFees = require('./studentFees.model')(sequelize, Sequelize)
db.StudentPayment = require('./studentPayment.model')(sequelize, Sequelize)
db.NotificationType = require('./notificationType.model')(sequelize, Sequelize)
db.Notification = require('./notification.model')(sequelize, Sequelize)
db.SuperAdmin = require('./superAdmin.model')(sequelize, Sequelize)
db.Installment = require('./installment.model')(sequelize, Sequelize)
db.UserFCM = userFCMModel(sequelize, Sequelize)

// Define one-to-many associations between user and userRoles model
db.UserRole.hasMany(db.User, { foreignKey: 'role_id' })
db.User.belongsTo(db.UserRole, { foreignKey: 'role_id', as: 'role', onDelete: 'SET NULL', onUpdate: 'CASCADE' })

//  Define one-to-one associations between user and loginToken model
db.User.hasOne(db.LoginToken, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
db.LoginToken.belongsTo(db.User, { foreignKey: 'user_id' })

// Define one-to-one associations between user and manager model
db.User.hasOne(db.Manager, { foreignKey: 'user_id' })
db.Manager.belongsTo(db.User, { foreignKey: 'user_id', as: 'manager', onDelete: 'CASCADE', onUpdate: 'CASCADE' })

// Define one-to-many associations between standard and subjects
db.Standard.hasMany(db.Subject, {
    foreignKey: 'standard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

db.Subject.belongsTo(db.Standard, {
    foreignKey: 'standard_id',
    as: 'standard',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

// Define many-to-many associations between standard and subject model

// db.Standard.belongsToMany(db.Subject, {
//     through: db.standardSubjects,
//     foreignKey: 'standard_id',
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
// });

// db.Subject.belongsToMany(db.Standard, {
//     through: db.standardSubjects,
//     foreignKey: 'subject_id',
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
// });

//  Define one-to-many associations between batch and standard
// Define one-to-many associations between Standard and Batch
db.Standard.hasMany(db.Batch, {
    foreignKey: 'standard_id',
    as: 'batches', // Alias for accessing related batches
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.Batch.belongsTo(db.Standard, {
    foreignKey: 'standard_id',
    as: 'standard', // Alias for accessing the related standard
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Define one-to-one relationship between Standard and StandardFees
db.Standard.hasOne(db.StandardFees, {
    foreignKey: 'standard_id',
    onDelete: 'CASCADE', // When a Standard is deleted, the associated StandardFees will also be deleted
    onUpdate: 'CASCADE' // When a Standard is updated, the associated StandardFees will also be updated
});

db.StandardFees.belongsTo(db.Standard, {
    foreignKey: 'standard_id',
});

// define association between test and standard
db.Standard.hasMany(db.Test, {
    foreignKey: 'standard_id',
    as: 'tests', // Alias for accessing related tests
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Test.belongsTo(db.Standard, {
    foreignKey: 'standard_id',
    as: 'standard', // Alias for accessing the related standard
})

// define association between test and subjects
db.Subject.hasMany(db.Test, {
    foreignKey: 'subject_id',
    as: 'tests', // Alias for accessing related tests
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Test.belongsTo(db.Subject, {
    foreignKey: 'subject_id',
    as: 'subjects', // Alias for accessing the related standard
})

// define association between test and batches

db.Batch.hasMany(db.Test, {
    foreignKey: 'batch_id',
    as: 'tests',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Test.belongsTo(db.Batch, {
    foreignKey: 'batch_id',
    as: 'batches'
})

//association between user and teacher
db.User.hasOne(db.Teacher, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Teacher.belongsTo(db.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

//teacher association with many standard, batches and subjects

db.Teacher.hasMany(db.TeacherAssignment, {
    foreignKey: 'teacher_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.TeacherAssignment.belongsTo(db.Teacher, {
    foreignKey: 'teacher_id'
});

// Standard associations (one-to-many)
db.Standard.hasMany(db.TeacherAssignment, {
    foreignKey: 'standard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.TeacherAssignment.belongsTo(db.Standard, {
    foreignKey: 'standard_id'
});

// Batch associations (one-to-many)
db.Batch.hasMany(db.TeacherAssignment, {
    foreignKey: 'batch_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.TeacherAssignment.belongsTo(db.Batch, {
    foreignKey: 'batch_id'
});

// Subject associations (one-to-many)
db.Subject.hasMany(db.TeacherAssignment, {
    foreignKey: 'subject_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.TeacherAssignment.belongsTo(db.Subject, {
    foreignKey: 'subject_id'
});

// Teacher has many lectures
db.Teacher.hasMany(db.Lecture, {
    foreignKey: 'teacher_id',
    as: 'lectures', // Updated to plural to represent a list of lectures
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Standard has many lectures
db.Standard.hasMany(db.Lecture, {
    foreignKey: 'standard_id',
    as: 'lectures', // Updated to plural
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Subject has many lectures
db.Subject.hasMany(db.Lecture, {
    foreignKey: 'subject_id',
    as: 'lectures', // Updated to plural
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Batch has many lectures
db.Batch.hasMany(db.Lecture, {
    foreignKey: 'batch_id',
    as: 'lectures', // Updated to plural
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Lecture belongs to associations (without alias)
db.Lecture.belongsTo(db.Teacher, { foreignKey: 'teacher_id' });
db.Lecture.belongsTo(db.Standard, { foreignKey: 'standard_id' });
db.Lecture.belongsTo(db.Subject, { foreignKey: 'subject_id' });
db.Lecture.belongsTo(db.Batch, { foreignKey: 'batch_id' });

//student associations
db.User.hasOne(db.Student, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Student.belongsTo(db.User, { foreignKey: 'user_id' })

db.Standard.hasMany(db.Student, {
    foreignKey: 'standard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Student.belongsTo(db.Standard, {
    foreignKey: 'standard_id'
})

db.Batch.hasMany(db.Student, {
    foreignKey: 'batch_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Student.belongsTo(db.Batch, {
    foreignKey: 'batch_id'
})

db.Organization.hasMany(db.Student, {
    foreignKey: 'organization_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Student.belongsTo(db.Organization, {
    foreignKey: 'organization_id'
})

//student and test associations

db.Student.hasMany(db.StudentResult, {
    foreignKey: 'student_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.StudentResult.belongsTo(db.Student, { foreignKey: 'student_id' })

db.Test.hasMany(db.StudentResult, {
    foreignKey: 'test_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.StudentResult.belongsTo(db.Test, { foreignKey: 'test_id' })

//student and attendance association
db.Student.hasMany(db.StudentAttendance, {
    foreignKey: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.StudentAttendance.belongsTo(db.Student, {
    foreignKey: 'student_id'
})

db.NotificationType.hasMany(db.Notification, {
    foreignKey: 'notification_type_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Notification.belongsTo(db.NotificationType, {
    foreignKey: 'notification_type_id'
})

db.User.hasMany(db.Notification, {
    foreignKey: 'user_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Notification.belongsTo(db.User, {
    foreignKey: 'user_id'
})

db.User.hasOne(db.SuperAdmin, {
    foreignKey: 'user_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.SuperAdmin.belongsTo(db.User, {
    foreignKey: 'user_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

// fees relation with standard and student with installment

// db.Student.hasOne(db.StudentFees, {
//     foreignKey: 'student_id',
//     onUpdate: 'CASCADE',
//     onDelete: 'CASCADE'
// })

// db.StudentFees.belongsTo(db.Student,{
//     foreignKey: 'student_id'
// })

// db.StandardFees.hasOne(db.StudentFees,{
//     foreignKey: 'fees_id',
//     onUpdate: 'CASCADE',
//     onDelete: 'CASCADE'
// })

// db.StudentFees.belongsTo(db.StandardFees, {
//     foreignKey: 'fees_id'
// })

// db.StudentFees.hasMany(db.StudentPayment, {
//     foreignKey: 'student_fees_id',
//     onUpdate: 'CASCADE',
//     onDelete: 'CASCADE'
// })

// db.StudentPayment.belongsTo(db.StudentFees, {
//     foreignKey: 'student_fees_id'
// })

db.StandardFees.hasMany(db.Installment, {
    foreignKey: 'fees_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Installment.belongsTo(db.StandardFees, {
    foreignKey: 'fees_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.StandardFees.hasMany(db.StudentFees, {
    foreignKey: 'fees_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.StudentFees.belongsTo(db.StandardFees, {
    foreignKey: 'fees_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Student.hasMany(db.StudentFees, {
    foreignKey: 'student_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.StudentFees.belongsTo(db.Student, {
    foreignKey: 'student_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Installment.hasMany(db.StudentPayment, {
    foreignKey: 'installment_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.StudentPayment.belongsTo(db.Installment, {
    foreignKey: 'installment_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.Student.hasMany(db.StudentPayment, {
    foreignKey: 'student_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.StudentPayment.belongsTo(db.Student, {
    foreignKey: 'student_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

//user and userFCM tokens 
db.User.hasMany(db.UserFCM, {
    foreignKey: 'user_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

db.UserFCM.belongsTo(db.User, {
    foreignKey: 'user_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})


// sequelize.sync({alter: true})

module.exports = db

