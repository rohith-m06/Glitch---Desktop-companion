# Setup Guide

## Prerequisites

Before starting, ensure you have:
1.  **Node.js**: Version 16.0 or higher ([Download](https://nodejs.org/)).
2.  **npm**: Included with Node.js.
3.  **A Microphone**: For voice interaction.

---

## Step 1: Get API Keys

This application requires two API keys to function. Both offer free tiers sufficient for personal use.

### 1. Google Gemini API Key
This powers the brain and vision of your companion.
1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **Create API Key**.
3.  Copy the key (starts with `AIza...`).

### 2. ElevenLabs API Key
This provides the realistic voice.
1.  Go to [ElevenLabs](https://elevenlabs.io/).
2.  Sign up/Login.
3.  Click your profile icon -> **Profile + API Key**.
4.  Click the "Eye" icon to reveal and copy your key.

---

## Step 2: Installation

1.  **Download the Installer** from the [Releases Page](#).
2.  **Run the Installer** (`.exe` for Windows, `.dmg` for Mac).
3.  **Launch** "AI Desktop Companion".

---

## Step 3: First Run Configuration

1.  On first launch, you will see the **Setup Wizard**.
2.  Paste your **Gemini API Key**.
3.  Paste your **ElevenLabs API Key**.
4.  (Optional) Enter a specific Voice ID if you have a custom one, otherwise leave blank for the default.
5.  Click **Start Companion**.

The app will verify your keys and then the companion will appear on your desktop!

---

## Troubleshooting

### "Error: Invalid API Key"
- Double-check you didn't copy any extra spaces.
- Ensure your Google Cloud project has the "Generative Language API" enabled.

### "Microphone Access Denied"
- Check your OS privacy settings (Settings -> Privacy -> Microphone).
- Ensure "Allow desktop apps to access your microphone" is ON.

### Overlay is Black/Invisible
- This app requires a GPU for transparency effects. Ensure hardware acceleration is enabled.
- On laptops, try plugging in power.
