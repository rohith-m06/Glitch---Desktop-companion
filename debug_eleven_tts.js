require('dotenv').config();
const https = require('https');

const args = process.argv.slice(2);
const key = args[0] || process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
const voiceId = args[1] || process.env.ELEVENLABS_VOICE_ID || process.env.ELEVEN_VOICE_ID;

console.log(`Testing Key: ${key ? key.substring(0, 5) + '...' : 'None'}`);
console.log(`Voice ID: ${voiceId}`);

if (!key || !voiceId) {
    console.error("Missing Key or Voice ID");
    process.exit(1);
}

const text = "Test";
const postData = JSON.stringify({
    text: text,
    model_id: "eleven_turbo_v2_5", // Using the app's model
    voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
    }
});

const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: `/v1/text-to-speech/${voiceId}`,
    method: 'POST',
    headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log("Sending TTS Request...");
const req = https.request(options, (res) => {
    console.log(`TTS Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("TTS Success! Audio binary received.");
        } else {
            console.error("TTS Failed. Response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});

req.write(postData);
req.end();
