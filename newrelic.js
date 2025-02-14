require('dotenv').config();
exports.config = {
    app_name: [process.env.NEW_RELIC_APP_NAME || 'My App'],
    license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your_license_key',
    logging: {
        level: 'info', // 'trace' for more detailed logs
    },
    distributed_tracing: {
        enabled: true, // Required for `getLinkingMetadata`
    },
};
