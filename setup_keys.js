const webpush = require('web-push');
const fs = require('fs');

const keys = webpush.generateVAPIDKeys();
const envContent = `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\nVAPID_SUBJECT=mailto:admin@example.com\n`;

fs.appendFileSync('.env', envContent);
console.log('Keys appended to .env');
