// Advanced Dynamic Island Component - Enhanced with AI Chat and Boot Mode
class DynamicIsland {
    constructor() {
        this.container = null;
        this.statusText = '';
        this.isExpanded = false;
        this.isVisible = true;
        this.aiEnabled = true;
        this.aiHistory = [];
        this.emulator = null;
        this.state = 'compact'; // 'compact', 'expanded', 'boot-mode', 'chat-mode'
        this.progress = 0;
        this.progressStartTime = null;
        this.progressLastUpdate = null;
        this.progressLastValue = 0;
        this.autoHideTimeout = null;
        this.windowsReady = false;
        this.selectedModel = localStorage.getItem('wind0_ai_model') || 'gpt-4.1-2025-04-14';
        this.availableModels = [
            {id: "gpt-4.1-nano-2025-04-14", name: "GPT-4.1 Nano", context: "5K chars"},
            {id: "gpt-4.1-2025-04-14", name: "GPT-4.1", context: "10K chars"},
            {id: "gpt-5-mini", name: "GPT-5 Mini", context: "7K chars"},
            {id: "gpt-o4-mini-2025-04-16", name: "GPT-O4 Mini", context: "Unknown"},
            {id: "deepseek-v3.1", name: "DeepSeek v3.1", context: "10K chars"},
            {id: "mistral-small-3.1-24b-instruct-2503", name: "Mistral Small 3.1", context: "Unknown"},
            {id: "codestral-2405", name: "Codestral 2405", context: "32K tokens"},
            {id: "codestral-2501", name: "Codestral 2501", context: "32K tokens"},
            {id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", context: "Unknown"},
            {id: "gemini-search", name: "Gemini Search", context: "Unknown"},
            {id: "llama-3.1-8B-instruct", name: "Llama 3.1 8B", context: "Unknown"},
            {id: "bidara", name: "Bidara", context: "Unknown"},
            {id: "glm-4.5-flash", name: "GLM 4.5 Flash", context: "Unknown"},
            {id: "rtist", name: "Rtist", context: "Unknown"}
        ];
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
        statusEl.textContent = 'wind0';
        
        // Progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'island-progress-container';
        progressContainer.id = 'island-progress-container';
        progressContainer.style.display = 'none';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'island-progress-bar';
        progressBar.id = 'island-progress-bar';
        
        const progressText = document.createElement('div');
        progressText.className = 'island-progress-text';
        progressText.id = 'island-progress-text';
        
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        
        // AI indicator
        const aiIndicator = document.createElement('div');
        aiIndicator.className = 'ai-indicator';
        aiIndicator.id = 'ai-indicator';
        aiIndicator.title = 'AI Assistant Active';
        
        mainContent.appendChild(statusEl);
        mainContent.appendChild(progressContainer);
        mainContent.appendChild(aiIndicator);
        
        // Expanded controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'island-controls';
        controlsEl.id = 'island-controls';
        
        // Control buttons
        const controls = [
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`, 
                action: 'settings', 
                title: 'Settings (S)' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>`, 
                action: 'restart', 
                title: 'Restart VM (R)' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`, 
                action: 'fullscreen', 
                title: 'Fullscreen (F11)' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`, 
                action: 'chat', 
                title: 'AI Chat' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`, 
                action: 'minimize', 
                title: 'Minimize' 
            }
        ];
        
        controls.forEach(ctrl => {
            const btn = document.createElement('button');
            btn.className = 'island-btn';
            btn.innerHTML = ctrl.icon;
            btn.title = ctrl.title;
            btn.onclick = (e) => {
                e.stopPropagation();
                this.handleAction(ctrl.action);
            };
            controlsEl.appendChild(btn);
        });
        
        this.container.appendChild(mainContent);
        this.container.appendChild(controlsEl);
        
        // Boot mode panel (shown when Windows is not ready)
        this.createBootModePanel();
        
        // Chat panel
        this.createChatPanel();
        
        // Event listeners
        let hoverTimeout = null;
        this.container.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            if (!this.isExpanded && this.windowsReady) {
                this.expand();
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                if (!this.isExpanded && this.windowsReady) {
                    this.collapse();
                }
            }, 300);
        });
        
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.closest('.island-main')) {
                e.stopPropagation();
                if (this.windowsReady) {
                    this.toggleExpanded();
                }
            }
        });
        
        this.container.addEventListener('mousedown', (e) => e.stopPropagation());
        this.container.addEventListener('mouseup', (e) => e.stopPropagation());
        
        document.body.appendChild(this.container);
        this.initAI();
        this.positionTopCenter();
        this.startAutoHide();
        
        // Show boot mode initially
        this.enterBootMode();
    }

    createBootModePanel() {
        const bootPanel = document.createElement('div');
        bootPanel.className = 'island-boot-panel';
        bootPanel.id = 'island-boot-panel';
        bootPanel.style.display = 'none';
        
        bootPanel.innerHTML = `
            <div class="boot-panel-header">
                <h3>Windows Setup</h3>
                <p>Windows is starting up. This may take 30-60 seconds.</p>
            </div>
            <div class="boot-panel-content">
                <div class="boot-info">
                    <div class="boot-status-item">
                        <span class="boot-label">Status:</span>
                        <span class="boot-value" id="boot-status-value">Initializing...</span>
                    </div>
                    <div class="boot-status-item">
                        <span class="boot-label">Progress:</span>
                        <span class="boot-value" id="boot-progress-value">0%</span>
                    </div>
                    <div class="boot-status-item">
                        <span class="boot-label">Time Remaining:</span>
                        <span class="boot-value" id="boot-time-value">Calculating...</span>
                    </div>
                </div>
                <div class="boot-tips">
                    <h4>Tips:</h4>
                    <ul>
                        <li>Keep this tab open during boot</li>
                        <li>Don't close or refresh the page</li>
                        <li>Windows will be ready shortly</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.container.appendChild(bootPanel);
    }

    createChatPanel() {
        const chatPanel = document.createElement('div');
        chatPanel.className = 'island-chat-panel';
        chatPanel.id = 'island-chat-panel';
        chatPanel.style.display = 'none';
        
        chatPanel.innerHTML = `
            <div class="chat-panel-header">
                <div class="chat-header-left">
                    <h3>AI Assistant</h3>
                    <select id="ai-model-select" class="model-select">
                        ${this.availableModels.map(m => 
                            `<option value="${m.id}" ${m.id === this.selectedModel ? 'selected' : ''}>${m.name} (${m.context})</option>`
                        ).join('')}
                    </select>
                </div>
                <button class="chat-close-btn" onclick="window.dynamicIslandInstance?.exitChatMode()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="chat-message ai-message">
                    <div class="message-content">Hello! I'm your AI assistant. How can I help you with Windows?</div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" class="chat-input" placeholder="Ask me anything..." autocomplete="off">
                <button id="chat-send-btn" class="chat-send-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        
        this.container.appendChild(chatPanel);
        
        // Setup chat event listeners
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            const chatSendBtn = document.getElementById('chat-send-btn');
            const modelSelect = document.getElementById('ai-model-select');
            
            if (chatInput && chatSendBtn) {
                const sendMessage = () => {
                    const message = chatInput.value.trim();
                    if (message) {
                        this.sendChatMessage(message);
                        chatInput.value = '';
                    }
                };
                
                chatSendBtn.onclick = sendMessage;
                chatInput.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                };
            }
            
            if (modelSelect) {
                modelSelect.onchange = (e) => {
                    this.selectedModel = e.target.value;
                    localStorage.setItem('wind0_ai_model', this.selectedModel);
                    this.addChatMessage('AI', `Switched to ${modelSelect.options[modelSelect.selectedIndex].text}`);
                };
            }
        }, 100);
    }

    enterBootMode() {
        if (!this.windowsReady) {
            this.state = 'boot-mode';
            this.container.classList.add('boot-mode');
            const bootPanel = document.getElementById('island-boot-panel');
            if (bootPanel) {
                bootPanel.style.display = 'block';
            }
            this.container.style.width = 'auto';
            this.container.style.minWidth = '400px';
            this.container.style.maxWidth = '600px';
        }
    }

    exitBootMode() {
        this.windowsReady = true;
        this.state = 'compact';
        this.container.classList.remove('boot-mode');
        const bootPanel = document.getElementById('island-boot-panel');
        if (bootPanel) {
            bootPanel.style.display = 'none';
        }
        this.container.style.width = 'auto';
        this.container.style.minWidth = '100px';
        this.container.style.maxWidth = '500px';
    }

    enterChatMode() {
        this.state = 'chat-mode';
        this.isExpanded = true;
        this.container.classList.add('chat-mode');
        const chatPanel = document.getElementById('island-chat-panel');
        if (chatPanel) {
            chatPanel.style.display = 'block';
        }
        this.container.style.width = 'auto';
        this.container.style.minWidth = '400px';
        this.container.style.maxWidth = '600px';
        this.container.style.height = 'auto';
        this.container.style.maxHeight = '70vh';
        
        // Focus input
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
    }

    exitChatMode() {
        this.state = this.windowsReady ? 'compact' : 'boot-mode';
        this.isExpanded = false;
        this.container.classList.remove('chat-mode');
        const chatPanel = document.getElementById('island-chat-panel');
        if (chatPanel) {
            chatPanel.style.display = 'none';
        }
        this.container.style.width = 'auto';
        this.container.style.height = '40px';
        this.container.style.maxHeight = 'none';
        
        if (!this.windowsReady) {
            this.enterBootMode();
        } else {
            this.collapse();
        }
    }

    addChatMessage(role, content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(content)}</div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async sendChatMessage(message) {
        this.addChatMessage('user', message);
        
        this.updateStatus('AI thinking...', 0);
        
        const response = await this.queryAI(message);
        
        if (response) {
            this.addChatMessage('AI', response);
            const executed = await this.executeAICommand(response, this.emulator);
            if (executed) {
                this.updateStatus('Command executed', 2000);
            }
        } else {
            this.addChatMessage('AI', 'Sorry, I encountered an error. Please try again.');
            this.updateStatus('AI unavailable', 2000);
        }
    }

    positionTopCenter() {
        this.container.style.top = '16px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.right = 'auto';
        this.container.style.display = 'flex';
        this.container.style.opacity = '1';
        this.container.style.visibility = 'visible';
        this.container.style.pointerEvents = 'auto';
        // Ensure it's above loading overlay
        this.container.style.zIndex = '10001';
    }

    expand() {
        if (this.state === 'compact' && this.windowsReady) {
            this.state = 'expanded';
            this.container.classList.add('expanded');
            clearTimeout(this.autoHideTimeout);
            
            setTimeout(() => {
                const controls = document.getElementById('island-controls');
                if (controls) {
                    controls.style.display = 'flex';
                }
            }, 150);
        }
    }

    collapse() {
        if (this.state === 'expanded' && !this.isExpanded && this.windowsReady) {
            this.state = 'compact';
            this.container.classList.remove('expanded');
            const controls = document.getElementById('island-controls');
            if (controls) {
                controls.style.display = 'none';
            }
            this.startAutoHide();
        }
    }

    toggleExpanded() {
        if (this.windowsReady) {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }

    startAutoHide() {
        clearTimeout(this.autoHideTimeout);
        if (this.windowsReady) {
            this.autoHideTimeout = setTimeout(() => {
                if (!this.isExpanded && this.progress === 0 && !this.container.matches(':hover')) {
                    this.container.style.opacity = '0.6';
                }
            }, 5000);
        }
    }

    handleAction(action) {
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        switch(action) {
            case 'settings':
                if (typeof showSettings === 'function') {
                    showSettings();
                    this.updateStatus('Settings', 2000);
                }
                break;
            case 'restart':
                if (typeof restartVM === 'function') {
                    if (confirm('Restart Windows VM? This will reset the current session.')) {
                        restartVM();
                        this.updateStatus('Restarting...', 0);
                        this.exitBootMode();
                        this.enterBootMode();
                    }
                }
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'chat':
                this.enterChatMode();
                break;
            case 'minimize':
                this.toggle();
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

    async initAI() {
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
                    model: this.selectedModel,
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
        
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        const statusEl = document.getElementById('island-status');
        if (statusEl) {
            statusEl.style.opacity = '0';
            setTimeout(() => {
                statusEl.textContent = text;
                this.statusText = text;
                statusEl.style.opacity = '1';
            }, 150);
            
            this.container.classList.add('pulse');
            setTimeout(() => {
                this.container.classList.remove('pulse');
            }, 300);
        }
        
        // Update boot panel if in boot mode
        if (this.state === 'boot-mode') {
            const bootStatus = document.getElementById('boot-status-value');
            if (bootStatus) {
                bootStatus.textContent = text;
            }
        }
    }

    updateProgress(percent, statusText = null, totalBytes = null, loadedBytes = null) {
        if (!this.container) return;
        
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        const progressContainer = document.getElementById('island-progress-container');
        const progressBar = document.getElementById('island-progress-bar');
        const progressText = document.getElementById('island-progress-text');
        
        if (!progressContainer || !progressBar || !progressText) return;
        
        this.progress = Math.max(0, Math.min(100, percent));
        
        if (this.progress > 0 && this.progress < 100) {
            progressContainer.style.display = 'flex';
            progressBar.style.setProperty('--progress-width', this.progress + '%');
            
            const now = Date.now();
            if (!this.progressStartTime) {
                this.progressStartTime = now;
                this.progressLastUpdate = now;
                this.progressLastValue = 0;
            }
            
            let timeRemaining = '';
            
            if (this.progressLastValue > 0 && this.progress > this.progressLastValue) {
                const timeDiff = now - this.progressLastUpdate;
                const progressDiff = this.progress - this.progressLastValue;
                
                if (progressDiff > 0 && timeDiff > 0) {
                    const progressPerMs = progressDiff / timeDiff;
                    const remainingProgress = 100 - this.progress;
                    const estimatedMs = remainingProgress / progressPerMs;
                    
                    if (estimatedMs > 0 && estimatedMs < 3600000) {
                        const seconds = Math.ceil(estimatedMs / 1000);
                        if (seconds < 60) {
                            timeRemaining = `${seconds}s`;
                        } else {
                            const minutes = Math.floor(seconds / 60);
                            const secs = seconds % 60;
                            timeRemaining = `${minutes}m ${secs > 0 ? secs + 's' : ''}`;
                        }
                    }
                }
            }
            
            if (statusText) {
                this.updateStatus(statusText, 0);
            }
            
            let displayText = `${Math.round(this.progress)}%`;
            if (timeRemaining) {
                displayText += ` • ${timeRemaining} left`;
            }
            if (totalBytes && loadedBytes) {
                const loadedMB = (loadedBytes / 1024 / 1024).toFixed(1);
                const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
                displayText += ` • ${loadedMB}/${totalMB}MB`;
            }
            
            progressText.textContent = displayText;
            
            // Update boot panel
            if (this.state === 'boot-mode') {
                const bootProgress = document.getElementById('boot-progress-value');
                const bootTime = document.getElementById('boot-time-value');
                if (bootProgress) bootProgress.textContent = `${Math.round(this.progress)}%`;
                if (bootTime) bootTime.textContent = timeRemaining || 'Calculating...';
            }
            
            this.progressLastUpdate = now;
            this.progressLastValue = this.progress;
        } else {
            progressContainer.style.display = 'none';
            if (this.progress >= 100) {
                this.progressStartTime = null;
                this.progressLastUpdate = null;
                this.progressLastValue = 0;
                this.exitBootMode();
                this.startAutoHide();
            }
        }
    }

    setWindowsReady(ready) {
        this.windowsReady = ready;
        if (ready) {
            this.exitBootMode();
        } else {
            this.enterBootMode();
        }
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.container) {
            this.container.classList.toggle('hidden', !this.isVisible);
            if (this.isVisible) {
                this.container.style.opacity = '1';
            }
        }
    }

    setAIEnabled(enabled) {
        this.aiEnabled = enabled;
        const indicator = document.getElementById('ai-indicator');
        if (indicator) {
            indicator.classList.toggle('active', enabled);
            indicator.title = enabled ? 'AI Assistant Active' : 'AI Assistant Inactive';
        }
    }

    setEmulator(emulator) {
        this.emulator = emulator;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.DynamicIsland = DynamicIsland;
    // Store instance globally for chat close button
    window.dynamicIslandInstance = null;
}
