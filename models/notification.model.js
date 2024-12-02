module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define('notifications', {
        notification_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        notification_type_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'notificationTypes',
                key: 'notification_type_id'
            }    
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        title: {
            type: Sequelize.STRING
        },
        message: {
            type: Sequelize.STRING
        },
        is_read: {
            type: Sequelize.BOOLEAN,
            defaultValue: false // Optional: Default value for `is_read`
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW // Set default to the current date and time
        }
    },{
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['is_read']
            }
        ]
    })

    return Notification;
}