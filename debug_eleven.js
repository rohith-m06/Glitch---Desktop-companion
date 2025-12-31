require('dotenv').config();
const https = require('https');

const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVEN_VOICE_ID;

console.log("Checking ElevenLabs configuration...");
// Mask key for safety in logs
const maskedKey = key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : "None";
console.log(`Key present: ${!!key} (${maskedKey})`);
console.log(`Voice ID present: ${!!voiceId} (${voiceId})`);

if (!key) {
    console.error("No API key found in environment.");
    process.exit(1);
}

const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: '/v1/user',
    method: 'GET',
    headers: {
        'xi-api-key': key
    }
};

const req = https.request(options, (res) => {
    console.log(`User Info Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const json = JSON.parse(data);
            console.log("Subscription Info:", JSON.stringify(json.subscription, null, 2));
            console.log("Status: Key is VALID.");

            // Verification of Voice ID
            if (voiceId) {
                console.log("\nVerifying Voice ID...");
                const voiceReq = https.request({
                    hostname: 'api.elevenlabs.io',
                    port: 443,
                    path: `/v1/voices/${voiceId}`,
                    method: 'GET',
                    headers: { 'xi-api-key': key }
                }, (vRes) => {
                    console.log(`Voice ID Status Code: ${vRes.statusCode}`);
                    if (vRes.statusCode === 200) {
                        console.log("Voice ID is VALID.");
                    } else {
                        console.log("Voice ID is INVALID or not found.");
                    }
                });
                voiceReq.end();
            }

        } else {
            console.error("Error Response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
