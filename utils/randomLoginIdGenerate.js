async function generateLoginIdWithRandom(role, model) {
    const rolePrefixes = {
        'Super Admin': 'A',
        'Manager': 'M',
        'Teacher': 'T',
        'Student': 'S',
    };

    const formattedRole = role.trim();
    const prefix = rolePrefixes[formattedRole] || 'U'; // Default to 'U' if role is unrecognized
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
    const loginId = `${prefix}${randomNumber}`; // Combine the role prefix with the random number

    // Check if this login_id already exists in the database
    const isDuplicate = await model.findOne({
        where: { login_id: loginId },
    });

    // If duplicate found, retry
    if (isDuplicate) {
        return generateLoginIdWithRandom(role, model); // Recursive call to retry with a new number
    }

    return loginId;
}


module.exports = generateLoginIdWithRandom;