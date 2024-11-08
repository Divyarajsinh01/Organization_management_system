module.exports = (sequelize, Sequelize) => {
    const LoginToken = sequelize.define('loginTokens', {
        token_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        token: {
            type:  Sequelize.STRING
        }
    },{
        timestamps: false
    })

    return LoginToken
}