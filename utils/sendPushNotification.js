const messaging = require("../firebaseConfig");

const sendPushNotification = async (title, body, token) => {
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            token: token
          };
          
          // Send a message to the device corresponding to the provided
          // registration token.
        const messageData = await messaging.send(message)

        return messageData
    } catch (error) {
        // throw error
        return;
    }
}

module.exports = sendPushNotification