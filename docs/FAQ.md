# Frequently Asked Questions

## General

**Q: Is AI Companion free?**
A: The software itself is open source and free. However, it requires API keys from Google (Gemini) and ElevenLabs, which have their own pricing. Both offer generous free tiers.

**Q: Does it work on Mac/Linux?**
A: Yes! AI Companion is built on Electron and supports Windows, macOS, and Linux. Most features work identically across platforms.

## Privacy & Security

**Q: Does it record my screen all the time?**
A: **No.** It only captures a screenshot when you explicitly ask it to "look" at something or when it is in autonomous "Agent Mode" executing a task.

**Q: Where are my API keys stored?**
A: Keys are stored locally on your machine in a protected configuration file using `electron-store`. They are never sent to our servers.

**Q: Can it delete my files?**
A: In "Agent Mode", it has the ability to run shell commands. While it is prompted to be safe, we recommend only running it in folders you are comfortable with. You can always hit the **Stop** button to kill any active process immediately.

## Customization

**Q: Can I change the voice?**
A: Yes! In the `src/renderer.js` file (or via the setup wizard), you can change the `ELEVEN_VOICE_ID` to any voice ID from your ElevenLabs library.

**Q: Can I change the character?**
A: The character is rendered using PixiJS. You can modify the sprite handling in `src/renderer.js` to use different assets.

## Troubleshooting

**Q: The AI hears itself talking!**
A: This is a common issue with open speakers.
1.  Use headphones if possible.
2.  Adjust the microphone sensitivity in your OS.
3.  We have implemented "echo cancellation" logic that pauses listening while the AI speaks, but it's not perfect.

**Q: VS Code automation isn't working.**
A: Ensure you have the `code` command installed in your PATH. Try typing `code --version` in your terminal to verify.
