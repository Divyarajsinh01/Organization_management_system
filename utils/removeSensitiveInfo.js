module.exports =  removeSensitiveInfo = (user) => {
    const userData = user.toJSON(); // Convert Sequelize instance to plain object
    delete userData.password; // Remove password field
    // Add any other sensitive fields you want to remove
    return userData;
}

