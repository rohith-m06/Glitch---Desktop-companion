const Store = require('electron-store');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class CredentialService {
    constructor() {
        this.store = new Store({
            encryptionKey: 'ai-companion-secure-storage', // Basic obfuscation
            name: 'user-credentials'
        });
    }

    /**
     * Initialize credentials from .env if available (migration/dev mode)
     */
    async loadCredentials() {
        // 1. Try to load from Store first
        let geminiKey = this.store.get('google_api_key');
        let elevenKey = this.store.get('eleven_api_key');
        let elevenVoice = this.store.get('eleven_voice_id');

        // 2. Fallback to process.env (legacy/dev)
        if (!geminiKey && process.env.GOOGLE_API_KEY) {
            console.log('📦 Migrating Gemini key from .env to secure store...');
            geminiKey = process.env.GOOGLE_API_KEY;
            this.store.set('google_api_key', geminiKey);
        }

        if (!elevenKey && process.env.ELEVEN_API_KEY) {
            console.log('📦 Migrating ElevenLabs key from .env to secure store...');
            elevenKey = process.env.ELEVEN_API_KEY;
            this.store.set('eleven_api_key', elevenKey);
        }

        if (!elevenVoice && process.env.ELEVEN_VOICE_ID) {
            elevenVoice = process.env.ELEVEN_VOICE_ID;
            this.store.set('eleven_voice_id', elevenVoice);
        }

        // 3. Inject back into process.env so the rest of the app works seamlessly
        if (geminiKey) process.env.GOOGLE_API_KEY = geminiKey;
        if (elevenKey) process.env.ELEVEN_API_KEY = elevenKey;
        if (elevenVoice) process.env.ELEVEN_VOICE_ID = elevenVoice;

        return {
            geminiKey,
            elevenKey,
            elevenVoice,
            isComplete: !!(geminiKey && elevenKey)
        };
    }

    saveCredentials({ geminiKey, elevenKey, elevenVoice }) {
        if (geminiKey) this.store.set('google_api_key', geminiKey);
        if (elevenKey) this.store.set('eleven_api_key', elevenKey);
        if (elevenVoice) this.store.set('eleven_voice_id', elevenVoice);

        // Update current session
        if (geminiKey) process.env.GOOGLE_API_KEY = geminiKey;
        if (elevenKey) process.env.ELEVEN_API_KEY = elevenKey;
        if (elevenVoice) process.env.ELEVEN_VOICE_ID = elevenVoice;
    }

    clearCredentials() {
        this.store.delete('google_api_key');
        this.store.delete('eleven_api_key');
        this.store.delete('eleven_voice_id');
    }
}

module.exports = new CredentialService();
