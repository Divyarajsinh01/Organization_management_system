const sequelize = require('../config/dbConnect');
const { Sequelize } = require('sequelize');

const db = {}

db.sequelize = sequelize
db.Sequelize = Sequelize

db.User = require('./user.model')(sequelize, Sequelize)
db.UserRole = require('./role.model')(sequelize, Sequelize)
db.LoginToken = require('./loginToken.model')(sequelize, Sequelize)
db.Manager = require('./manager.model')(sequelize, Sequelize)
db.Subject = require('./subjects.model')(sequelize, Sequelize)
db.Standard = require('./standards.model')(sequelize, Sequelize)
db.standardSubjects = require('./standardSubjects.model')(sequelize, Sequelize)
db.Batch = require('./batch.model')(sequelize, Sequelize)
db.Organization = require('./organization.model')(sequelize, Sequelize)
db.StandardFees = require('./standardsFees.model')(sequelize, Sequelize)
db.Test = require('./testSchedule.model')(sequelize, Sequelize)
db.Teacher = require('./teacher.model')(sequelize, Sequelize)
db.TeacherAssignment = require('./teacherAssignment.model')(sequelize, Sequelize)
db.Lecture = require('./lecture.model')(sequelize, Sequelize)
db.Student = require('./student.model')(sequelize, Sequelize)

// Define one-to-many associations between user and userRoles model
db.UserRole.hasMany(db.User, { foreignKey: 'role_id' })
db.User.belongsTo(db.UserRole, { foreignKey: 'role_id', as: 'role', onDelete: 'SET NULL', onUpdate: 'CASCADE' })

//  Define one-to-one associations between user and loginToken model
db.User.hasOne(db.LoginToken, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
db.LoginToken.belongsTo(db.User, { foreignKey: 'user_id' })

// Define one-to-one associations between user and manager model
db.User.hasOne(db.Manager, { foreignKey: 'user_id' })
db.Manager.belongsTo(db.User, { foreignKey: 'user_id', as: 'manager', onDelete: 'CASCADE', onUpdate: 'CASCADE' })


// Define many-to-many associations between standard and subject model

db.Standard.belongsToMany(db.Subject, {
    through: db.standardSubjects,
    foreignKey: 'standard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

db.Subject.belongsToMany(db.Standard, {
    through: db.standardSubjects,
    foreignKey: 'subject_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

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
    as:  'standard', // Alias for accessing the related standard
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
    as:  'subjects', // Alias for accessing the related standard
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

db.Student.belongsTo(db.User, {foreignKey: 'user_id'})

db.Standard.hasMany(db.Student, {
    foreignKey: 'standard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

db.Student.belongsTo(db.Standard,{
    foreignKey: 'Standard_id'
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

db.Student.belongsTo(db.Organization,{
    foreignKey: 'organization_id'
})

module.exports = db

