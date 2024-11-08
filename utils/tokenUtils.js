const jwt = require('jsonwebtoken');

exports.generateToken = (payload, expiresIn = null) => {
    try {
        const options = {}; // Options for token generation

        if (expiresIn) {
            options.expiresIn = expiresIn; // Only add expiresIn if it's provided
        }

        const token = jwt.sign(payload, process.env.JWT_SECURE_KEY, options);
        return token;
    } catch (error) {
        throw error;
    }
};

exports.verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECURE_KEY);
    return decoded;
}