
module.exports = (sequelize, Sequelize) => {
    const UserRole = sequelize.define('userRoles', {
        role_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        role: {
            type: Sequelize.STRING    
        }
    },{
        timestamps: true,
        paranoid: true,
    })

    return UserRole;
}