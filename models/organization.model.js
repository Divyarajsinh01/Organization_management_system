const { validateTimeFormat } = require("../utils/validation");

module.exports = (sequelize, Sequelize) => {
    const Organization = sequelize.define('organizations', {
        organization_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        organization_name: {
            type: Sequelize.STRING    
        },
        logo: {
            type : Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        organization_start_time: {
            type: Sequelize.TIME
        },
        organization_end_time: {
            type: Sequelize.TIME
        }
    },{
        timestamps: true,
        paranoid: true,
        indexes: [
            // {
            //     fields: ['organization_name', 'organization_time']
            // },
            {
                fields: ['organization_name', 'organization_start_time', 'organization_end_time']
            }
        ],        
        // hooks: {
        //     beforeCreate: (organization) => {
        //         validateTimeFormat(organization.organization_time)
        //     },
        //     beforeUpdate:  (organization) => {
        //         validateTimeFormat(organization.organization_time)
        //     }
        // }
    })

    return Organization
}