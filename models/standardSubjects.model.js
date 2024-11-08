module.exports = (sequelize, Sequelize) => {
    const standardSubjects = sequelize.define('standardSubjects', {
        standard_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'standards',
                key: 'standard_id'
            }
        },
        subject_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'subjects',
                key: 'subject_id'
            }
        },
    }, {
        timestamps: false
    })

    return standardSubjects

}