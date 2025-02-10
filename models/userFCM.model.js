// Export the model
module.exports = (sequelize, Sequelize) => {
    const UserFCM = sequelize.define('usersFCMTokens', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
            },
        },
        FCM_Token: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    }, {
        timestamps: true,
        paranoid: true,
    });
    
    return UserFCM
}