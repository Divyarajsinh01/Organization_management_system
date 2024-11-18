module.exports = (sequelize, Sequelize) => {
    const NotificationType = sequelize.define('notificationTypes', {
        notification_type_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        notification_type: {
            type: Sequelize.STRING    
        }
    },{
        timestamps: false
    })

    return NotificationType;
}