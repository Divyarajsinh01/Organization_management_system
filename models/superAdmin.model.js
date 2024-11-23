module.exports = (sequelize, Sequelize) => {
    const superAdmin = sequelize.define('superAdmins', {
        super_admin_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
            }
        }
    }, {
        timestamps: true,
        paranoid: true
    })

    return superAdmin
}