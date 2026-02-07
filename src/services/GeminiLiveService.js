const { WebSocket } = require('ws');
const EventEmitter = require('events');

class GeminiLiveService extends EventEmitter {
    constructor(apiKey, automationAgent) {
        super();
        this.apiKey = apiKey;
        this.automationAgent = automationAgent; // Instance of GameAgent or similar
        this.ws = null;
        this.isActive = false;
        // Updated to use a model available to the user. 
        // Trying 'gemini-3-flash-preview' as it appears in the user's available models list.
        // If this fails, 'gemini-2.5-flash-native-audio-latest' is another strong candidate.
        this.model = 'gemini-2.5-flash-native-audio-preview-12-2025'; 
    }

    start() {
        if (this.isActive) return;
        
        // Host might change, using the one for Multimodal Live API
        // For Gemini 2.0 Flash Live
        // Host: generativelanguage.googleapis.com
        // Path: /ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent
        const host = "generativelanguage.googleapis.com";
        const path = `/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
        const url = `wss://${host}${path}`;

        console.log(`[GeminiLive] Connecting to ${url.replace(this.apiKey, '***')}`);

        try {
            this.ws = new WebSocket(url);
        } catch (e) {
            console.error("[GeminiLive] Failed to create WebSocket. Make sure 'ws' package is installed if in Node.js environment:", e);
            // Fallback attempt if global WebSocket exists (unlikely in pure Node main process without polyfill)
            if (typeof global.WebSocket !== 'undefined') {
                 this.ws = new global.WebSocket(url);
            } else {
                 return;
            }
        }

        this.ws.on('open', () => {
            console.log('[GeminiLive] Connected');
            this.isActive = true;
            this._sendInitialSetup();
        });

        this.ws.on('message', async (data) => {
            // data is Buffer in 'ws'
            await this._handleMessage(data);
        });

        this.ws.on('close', (code, reason) => {
            console.log(`[GeminiLive] Disconnected. Code: ${code}, Reason: ${reason.toString()}`);
            this.isActive = false;
        });
        
        this.ws.on('error', (err) => {
             console.error('[GeminiLive] Error:', err);
             this.isActive = false;
        });
    }

    stop() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isActive = false;
    }

    sendAudioChunk(base64Audio) {
        if (!this.isActive || !this.ws || this.ws.readyState !== 1) return;
        
        const msg = {
            realtime_input: {
                media_chunks: [{
                    mime_type: "audio/pcm",
                    data: base64Audio
                }]
            }
        };
        this.ws.send(JSON.stringify(msg));
    }

    _sendInitialSetup() {
        const setupMsg = {
            setup: {
                model: `models/${this.model}`,
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: {
                            prebuilt_voice_config: {
                                voice_name: "Aoede"
                            }
                        }
                    }
                },
                tools: [{
                    function_declarations: [
                        {
                            name: "run_automation_task",
                            description: "Visual Automation: Use this for tasks requiring SIGHT (analyze screen, find button, describe image). Heavy and slow.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    description: { type: "STRING", description: "Instruction for the visual agent" }
                                },
                                required: ["description"]
                            }
                        },
                        {
                            name: "open_url",
                            description: "Fast Action: Open a website URL in the default browser immediately.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    url: { type: "STRING", description: "The full URL to open (e.g. google.com)" }
                                },
                                required: ["url"]
                            }
                        },
                        {
                            name: "google_search",
                            description: "Fast Action: Search Google for a query immediately.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    query: { type: "STRING", description: "The search query" }
                                },
                                required: ["query"]
                            }
                        },
                        {
                            name: "launch_app",
                            description: "Fast Action: Launch a desktop application (calculator, notepad, vscode, chrome, terminal).",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    appName: { type: "STRING", description: "Name of the app to launch" }
                                },
                                required: ["appName"]
                            }
                        },
                        {
                            name: "type_text",
                            description: "Fast Action: Type text on the keyboard immediately.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    text: { type: "STRING", description: "The text to type" }
                                },
                                required: ["text"]
                            }
                        }
                    ]
                }]
            }
        };
        this.ws.send(JSON.stringify(setupMsg));
    }

    async _handleMessage(data) {
        try {
            const str = data.toString();
            const response = JSON.parse(str);
            
            // Handle Tool Calls (The Handoff)
            if (response.toolCall) {
                console.log("[GeminiLive] Received Tool Call:", JSON.stringify(response.toolCall));
                await this._handleToolCall(response.toolCall);
            }
            
            // Handle Server Content (Audio/Text)
            if (response.serverContent) {
                 if (response.serverContent.modelTurn && response.serverContent.modelTurn.parts) {
                     for (const part of response.serverContent.modelTurn.parts) {
                         if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                             // Emit audio data to main process to send to renderer
                             this.emit('audio', part.inlineData.data);
                         }
                     }
                 }
            }

        } catch (e) {
            console.error("[GeminiLive] Error parsing message:", e);
        }
    }

    async _handleToolCall(toolCall) {
        const functionCalls = toolCall.functionCalls;
        if (!functionCalls || functionCalls.length === 0) return;

        for (const call of functionCalls) {
            let result = {};
            
            // --- FAST ACTIONS (Direct IPC) ---
            if (call.name === "open_url") {
                const url = call.args.url;
                this.emit('tool-action', { type: 'open', url: url });
                result = { output: `Opened ${url}` };
            }
            else if (call.name === "google_search") {
                const query = call.args.query;
                this.emit('tool-action', { type: 'search', query: query });
                result = { output: `Searched for ${query}` };
            }
            else if (call.name === "launch_app") {
                const appName = call.args.appName;
                this.emit('tool-action', { type: 'app', app: appName });
                result = { output: `Launched ${appName}` };
            }
            else if (call.name === "type_text") {
                const text = call.args.text;
                this.emit('tool-action', { type: 'type', text: text });
                result = { output: `Typed text` };
            }
            // --- SLOW ACTION (Visual Agent) ---
            else if (call.name === "run_automation_task") {
                const taskDescription = call.args.description;
                console.log(`[GeminiLive] Handoff to Automation: "${taskDescription}"`);
                try {
                    if (this.automationAgent.isActive) {
                         this.automationAgent.stop();
                    }
                    this.automationAgent.start(taskDescription);
                    result = { output: "I have started the visual agent for this task." };
                } catch (error) {
                    result = { error: "Failed to start task: " + error.message };
                }
            }

            // Send Response Back to Model
            const toolResponse = {
                tool_response: {
                    function_responses: [{
                        name: call.name,
                        id: call.id,
                        response: { result: result } 
                    }]
                }
            };
            this.ws.send(JSON.stringify(toolResponse));
        }
    }
}

module.exports = GeminiLiveService;
