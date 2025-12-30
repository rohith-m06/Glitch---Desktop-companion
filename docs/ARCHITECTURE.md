# System Architecture

## Overview

AI-Companion is a hybrid desktop application built with Electron, Node.js, and PixiJS. It combines:
1.  **Frontend Overlay**: A transparent, click-through window for the character and UI.
2.  **Backend Services**: Node.js processes for AI logic, automation, and system interaction.
3.  **AI Engine**: Google Gemini (intelligence) and ElevenLabs (voice).

## Core Components

### 1. Main Process (`main.js`)
- Manages window lifecycle (transparent overlay, setup wizard).
- Handles IPC communication between generic UI and specialized services.
- Enforces security (permission management, API key storage).

### 2. Renderer Process (`renderer.js`)
- **PixiJS**: Renders the animated character and floating UI particles.
- **Audio**: Handles audio playback and visualization.
- **Input**: Captures voice and user interactions.

### 3. AI Agent (`src/ai/GameAgent.js`)
- The "brain" of the autonomous agent.
- **Loop**: `Capture Screen` -> `Analyze with Gemini` -> `Plan Action` -> `Execute`.
- **Vision**: Uses `ScreenObserver` to capture and compress screenshots.
- **Tools**: Access to mouse, keyboard, shell, and browser automation.

### 4. Services
- **CredentialService**: Securely stores API keys using `electron-store`.
- **ProjectScaffoldService**: Automates directory creation and boilerplate generation.
- **EnhancedAutomationService**: Handles complex VS Code and shell workflows.
- **TelegramService**: (Optional) For remote control via chat.

## Data Flow

1.  **User Speaks** -> `renderer.js` captures audio -> Transcribed text sent to Main.
2.  **Main** -> Forwards to `GameAgent` or processes command.
3.  **GameAgent** -> Captures screen -> Sends prompt + image to Gemini 2.0.
4.  **Gemini** -> Returns text response + JSON action commands.
5.  **Action Execution**:
    - `speak`: TTS via ElevenLabs.
    - `click/type`: `InputController` (Nut.js).
    - `shell`: Node `child_process`.
    - `browser`: Playwright automation.

## Security Model

- **API Keys**: Stored in protected user data directory (not local storage).
- **Vision**: Screen data is processed in memory and sent only to Google's API; not saved to disk unless debug logging is enabled.
- **Shell**: Commands are executed with user privileges. "Turbo Mode" requires explicit start.
