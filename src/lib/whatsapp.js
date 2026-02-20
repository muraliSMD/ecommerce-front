export const sendWhatsAppMessage = async (to, message) => {
    try {
        // In a real application, you would use an API like Twilio or Interakt here.
        // For now, we will log the message to the console.
        
        console.log(`\n--- WHATSAPP NOTIFICATION ---`);
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        console.log(`-----------------------------\n`);

        // Example Twilio Implementation (Commented out):
        /*
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${to}`
        });
        */

        return true;
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        return false;
    }
};
