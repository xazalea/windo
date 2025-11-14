// Dynamic Island Component with AI Integration
class DynamicIsland {
    constructor() {
        this.container = null;
        this.statusText = '';
        this.isVisible = true;
        this.aiEnabled = true;
        this.aiHistory = [];
        this.init();
    }

    init() {
        // Create dynamic island container
        this.container = document.createElement('div');
        this.container.id = 'dynamic-island';
        this.container.className = 'dynamic-island';
        
        // Status text
        const statusEl = document.createElement('div');
        statusEl.className = 'island-status';
        statusEl.id = 'island-status';
        statusEl.textContent = 'Initializing...';
        
        // AI indicator (small dot)
        const aiIndicator = document.createElement('div');
        aiIndicator.className = 'ai-indicator';
        aiIndicator.id = 'ai-indicator';
        aiIndicator.title = 'AI Assistant Active';
        
        this.container.appendChild(statusEl);
        this.container.appendChild(aiIndicator);
        
        document.body.appendChild(this.container);
        
        // Initialize AI client
        this.initAI();
    }

    async initAI() {
        // AI is ready
        this.updateStatus('AI ready', 2000);
    }

    async queryAI(prompt) {
        if (!this.aiEnabled) return null;
        
        try {
            const response = await fetch('https://api.llm7.io/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'default',
                    messages: [
                        ...this.aiHistory.slice(-5), // Keep last 5 messages for context
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            // Add to history
            this.aiHistory.push(
                { role: 'user', content: prompt },
                { role: 'assistant', content: reply }
            );
            
            // Keep history limited
            if (this.aiHistory.length > 20) {
                this.aiHistory = this.aiHistory.slice(-20);
            }
            
            return reply;
        } catch (error) {
            console.warn('AI query failed:', error);
            return null;
        }
    }

    async executeAICommand(command, emulator) {
        // Parse AI command and execute on emulator
        const lowerCmd = command.toLowerCase();
        
        if (lowerCmd.includes('open') || lowerCmd.includes('launch')) {
            // Extract app name
            const appMatch = command.match(/(?:open|launch)\s+(\w+)/i);
            if (appMatch) {
                const app = appMatch[1];
                this.updateStatus(`Opening ${app}...`, 2000);
                // Send keyboard shortcut or command to emulator
                if (emulator && emulator.sendKeyboard) {
                    // Simulate Windows key + app name
                    emulator.sendKeyboard('Meta', 'down');
                    await new Promise(r => setTimeout(r, 100));
                    emulator.sendKeyboard('Meta', 'up');
                    await new Promise(r => setTimeout(r, 200));
                    // Type app name
                    for (const char of app) {
                        emulator.sendKeyboard(char, 'down');
                        await new Promise(r => setTimeout(r, 50));
                        emulator.sendKeyboard(char, 'up');
                    }
                    await new Promise(r => setTimeout(r, 200));
                    emulator.sendKeyboard('Enter', 'down');
                    emulator.sendKeyboard('Enter', 'up');
                }
                return true;
            }
        } else if (lowerCmd.includes('type') || lowerCmd.includes('write')) {
            // Extract text to type
            const textMatch = command.match(/(?:type|write)\s+(.+)/i);
            if (textMatch && emulator) {
                const text = textMatch[1];
                this.updateStatus(`Typing: ${text.substring(0, 20)}...`, 2000);
                for (const char of text) {
                    emulator.sendKeyboard(char, 'down');
                    await new Promise(r => setTimeout(r, 30));
                    emulator.sendKeyboard(char, 'up');
                }
                return true;
            }
        } else if (lowerCmd.includes('click') || lowerCmd.includes('press')) {
            // Extract key
            const keyMatch = command.match(/(?:click|press)\s+(\w+)/i);
            if (keyMatch && emulator) {
                const key = keyMatch[1];
                this.updateStatus(`Pressing ${key}...`, 1000);
                emulator.sendKeyboard(key, 'down');
                await new Promise(r => setTimeout(r, 50));
                emulator.sendKeyboard(key, 'up');
                return true;
            }
        }
        
        return false;
    }

    updateStatus(text, duration = 3000) {
        if (!this.container) return;
        
        const statusEl = document.getElementById('island-status');
        if (statusEl) {
            statusEl.textContent = text;
            this.statusText = text;
            
            // Add pulse animation
            this.container.classList.add('pulse');
            setTimeout(() => {
                this.container.classList.remove('pulse');
            }, 300);
            
            // Auto-hide after duration (unless it's a persistent status)
            if (duration > 0 && !text.includes('Booting') && !text.includes('Loading')) {
                setTimeout(() => {
                    if (this.statusText === text) {
                        this.updateStatus('Ready', 0);
                    }
                }, duration);
            }
        }
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.container) {
            this.container.classList.toggle('hidden', !this.isVisible);
        }
    }

    setAIEnabled(enabled) {
        this.aiEnabled = enabled;
        const indicator = document.getElementById('ai-indicator');
        if (indicator) {
            indicator.classList.toggle('active', enabled);
        }
    }

    async handleUserQuery(query, emulator) {
        if (!this.aiEnabled) {
            this.updateStatus('AI disabled', 2000);
            return;
        }
        
        this.updateStatus('AI thinking...', 0);
        
        const response = await this.queryAI(query);
        
        if (response) {
            // Try to execute as command first
            const executed = await this.executeAICommand(response, emulator);
            
            if (executed) {
                this.updateStatus('Command executed', 2000);
            } else {
                // Show AI response
                this.updateStatus(response.substring(0, 50), 5000);
            }
        } else {
            this.updateStatus('AI unavailable', 2000);
        }
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.DynamicIsland = DynamicIsland;
}

