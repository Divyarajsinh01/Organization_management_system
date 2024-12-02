// const sequelize = require("../config/dbConnect");
// const {DataTypes} = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Standard = sequelize.define('standards', {
        standard_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        standard: {
            type:  Sequelize.INTEGER,
            allowNull: false
        }
    },{
        timestamps: true,
        paranoid: true
    })

    return Standard
}