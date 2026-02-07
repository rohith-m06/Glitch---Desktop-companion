const Store = require('electron-store');
const fs = require('fs');
const path = require('path');
// [FIX] Explicit path for production (.env is in app root, CredentialService is in src/services/)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

        // 2. Fallback to process.env
        const envGemini = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        // --- GEMINI LOGIC ---
        let usingDefaultGemini = false;
        // If stored key matches .env key (from old migration), treat as default
        if (geminiKey && geminiKey === envGemini) {
            usingDefaultGemini = true;
            this.store.delete('google_api_key');
            geminiKey = envGemini;
        }
        else if (!geminiKey && envGemini) {
            geminiKey = envGemini;
            usingDefaultGemini = true;
        }

        // 3. Inject back into process.env so the rest of the app works seamlessly
        if (geminiKey) {
            process.env.GOOGLE_API_KEY = geminiKey;
            process.env.GEMINI_API_KEY = geminiKey;
        }

        return {
            geminiKey,
            usingDefaultGemini,
            isComplete: !!geminiKey
        };
    }

    saveCredentials({ geminiKey }) {
        if (geminiKey) this.store.set('google_api_key', geminiKey);
        else if (geminiKey === '') this.store.delete('google_api_key');

        // Update current session
        if (geminiKey) {
            process.env.GOOGLE_API_KEY = geminiKey;
            process.env.GEMINI_API_KEY = geminiKey;
        }
    }

    clearCredentials() {
        this.store.delete('google_api_key');
        this.store.delete('eleven_api_key');
        this.store.delete('eleven_voice_id');
    }
}

module.exports = new CredentialService();
