const generateRandomPassword = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';

    // Generate a password with random characters
    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if the password is strong enough
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#$]/.test(password);

    // If it doesn't meet the criteria, regenerate it
    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
        return generateRandomPassword(length); // Recursively generate a new password
    }

    return password;
}

module.exports = { generateRandomPassword }