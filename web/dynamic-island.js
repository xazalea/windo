// Advanced Dynamic Island Component - Replaces Toolbar
class DynamicIsland {
    constructor() {
        this.container = null;
        this.statusText = '';
        this.isExpanded = false;
        this.isVisible = true;
        this.aiEnabled = true;
        this.aiHistory = [];
        this.emulator = null;
        this.state = 'compact'; // 'compact', 'expanded', 'controls'
        this.init();
    }

    init() {
        // Create dynamic island container
        this.container = document.createElement('div');
        this.container.id = 'dynamic-island';
        this.container.className = 'dynamic-island';
        
        // Main content area
        const mainContent = document.createElement('div');
        mainContent.className = 'island-main';
        
        // Status text
        const statusEl = document.createElement('div');
        statusEl.className = 'island-status';
        statusEl.id = 'island-status';
        statusEl.textContent = 'Azalea';
        
        // AI indicator
        const aiIndicator = document.createElement('div');
        aiIndicator.className = 'ai-indicator';
        aiIndicator.id = 'ai-indicator';
        aiIndicator.title = 'AI Assistant';
        
        mainContent.appendChild(statusEl);
        mainContent.appendChild(aiIndicator);
        
        // Expanded controls (hidden by default)
        const controlsEl = document.createElement('div');
        controlsEl.className = 'island-controls';
        controlsEl.id = 'island-controls';
        
        // Control buttons
        const controls = [
            { icon: '⚙️', action: 'settings', title: 'Settings' },
            { icon: '🔄', action: 'restart', title: 'Restart' },
            { icon: '⛶', action: 'fullscreen', title: 'Fullscreen' },
            { icon: '🤖', action: 'ai', title: 'AI Assistant' },
            { icon: '✕', action: 'close', title: 'Close' }
        ];
        
        controls.forEach(ctrl => {
            const btn = document.createElement('button');
            btn.className = 'island-btn';
            btn.innerHTML = ctrl.icon;
            btn.title = ctrl.title;
            btn.onclick = () => this.handleAction(ctrl.action);
            controlsEl.appendChild(btn);
        });
        
        this.container.appendChild(mainContent);
        this.container.appendChild(controlsEl);
        
        // Add event listeners
        this.container.addEventListener('mouseenter', () => this.expand());
        this.container.addEventListener('mouseleave', () => this.collapse());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.closest('.island-main')) {
                this.toggleExpanded();
            }
        });
        
        document.body.appendChild(this.container);
        
        // Initialize AI
        this.initAI();
        
        // Start at top center (like iPhone dynamic island)
        this.positionTopCenter();
    }

    positionTopCenter() {
        // Position at top center of screen
        this.container.style.top = '20px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.right = 'auto';
    }

    expand() {
        if (this.state === 'compact') {
            this.state = 'expanded';
            this.container.classList.add('expanded');
            // Show controls after expansion animation
            setTimeout(() => {
                const controls = document.getElementById('island-controls');
                if (controls) {
                    controls.style.display = 'flex';
                }
            }, 200);
        }
    }

    collapse() {
        if (this.state === 'expanded' && !this.isExpanded) {
            this.state = 'compact';
            this.container.classList.remove('expanded');
            const controls = document.getElementById('island-controls');
            if (controls) {
                controls.style.display = 'none';
            }
        }
    }

    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        if (this.isExpanded) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    handleAction(action) {
        switch(action) {
            case 'settings':
                if (typeof showSettings === 'function') {
                    showSettings();
                }
                this.updateStatus('Settings', 2000);
                break;
            case 'restart':
                if (typeof restartVM === 'function') {
                    if (confirm('Restart Windows VM?')) {
                        restartVM();
                        this.updateStatus('Restarting...', 0);
                    }
                }
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'ai':
                this.toggleAI();
                break;
            case 'close':
                this.collapse();
                this.isExpanded = false;
                break;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not available:', err);
            });
            this.updateStatus('Fullscreen', 2000);
        } else {
            document.exitFullscreen();
            this.updateStatus('Windowed', 2000);
        }
    }

    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        this.setAIEnabled(this.aiEnabled);
        this.updateStatus(this.aiEnabled ? 'AI enabled' : 'AI disabled', 2000);
    }

    async initAI() {
        // AI is ready
        this.setAIEnabled(true);
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
                        ...this.aiHistory.slice(-5),
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            this.aiHistory.push(
                { role: 'user', content: prompt },
                { role: 'assistant', content: reply }
            );
            
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
        const lowerCmd = command.toLowerCase();
        
        if (lowerCmd.includes('open') || lowerCmd.includes('launch')) {
            const appMatch = command.match(/(?:open|launch)\s+(\w+)/i);
            if (appMatch && emulator) {
                const app = appMatch[1];
                this.updateStatus(`Opening ${app}...`, 2000);
                if (emulator.sendKeyboard) {
                    emulator.sendKeyboard('Meta', 'down');
                    await new Promise(r => setTimeout(r, 100));
                    emulator.sendKeyboard('Meta', 'up');
                    await new Promise(r => setTimeout(r, 200));
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
            const textMatch = command.match(/(?:type|write)\s+(.+)/i);
            if (textMatch && emulator) {
                const text = textMatch[1];
                this.updateStatus(`Typing...`, 2000);
                for (const char of text) {
                    emulator.sendKeyboard(char, 'down');
                    await new Promise(r => setTimeout(r, 30));
                    emulator.sendKeyboard(char, 'up');
                }
                return true;
            }
        }
        
        return false;
    }

    updateStatus(text, duration = 3000) {
        if (!this.container) return;
        
        const statusEl = document.getElementById('island-status');
        if (statusEl) {
            // Smooth text transition
            statusEl.style.opacity = '0';
            setTimeout(() => {
                statusEl.textContent = text;
                this.statusText = text;
                statusEl.style.opacity = '1';
            }, 150);
            
            // Pulse animation
            this.container.classList.add('pulse');
            setTimeout(() => {
                this.container.classList.remove('pulse');
            }, 300);
            
            // Auto-collapse to compact after duration
            if (duration > 0 && !text.includes('Booting') && !text.includes('Loading')) {
                setTimeout(() => {
                    if (this.statusText === text && !this.isExpanded) {
                        this.collapse();
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

    setEmulator(emulator) {
        this.emulator = emulator;
    }

    async handleUserQuery(query) {
        if (!this.aiEnabled) {
            this.updateStatus('AI disabled', 2000);
            return;
        }
        
        this.updateStatus('AI thinking...', 0);
        
        const response = await this.queryAI(query);
        
        if (response) {
            const executed = await this.executeAICommand(response, this.emulator);
            
            if (executed) {
                this.updateStatus('Done', 2000);
            } else {
                this.updateStatus(response.substring(0, 30), 5000);
            }
        } else {
            this.updateStatus('AI unavailable', 2000);
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.DynamicIsland = DynamicIsland;
}
