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
        this.state = 'compact';
        this.progress = 0;
        this.progressStartTime = null;
        this.progressLastUpdate = null;
        this.progressLastValue = 0;
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
        aiIndicator.title = 'AI Assistant';
        
        mainContent.appendChild(statusEl);
        mainContent.appendChild(progressContainer);
        mainContent.appendChild(aiIndicator);
        
        // Expanded controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'island-controls';
        controlsEl.id = 'island-controls';
        
        // Control buttons with Lucide icons (SVG)
        const controls = [
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>`, 
                action: 'settings', 
                title: 'Settings' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`, 
                action: 'restart', 
                title: 'Restart' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`, 
                action: 'fullscreen', 
                title: 'Fullscreen' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path><circle cx="12" cy="12" r="5"></circle></svg>`, 
                action: 'ai', 
                title: 'AI Assistant' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`, 
                action: 'close', 
                title: 'Close' 
            }
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
        
        // Event listeners
        this.container.addEventListener('mouseenter', () => this.expand());
        this.container.addEventListener('mouseleave', () => this.collapse());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.closest('.island-main')) {
                this.toggleExpanded();
            }
        });
        
        document.body.appendChild(this.container);
        this.initAI();
        this.positionTopCenter();
    }

    positionTopCenter() {
        this.container.style.top = '20px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.right = 'auto';
    }

    expand() {
        if (this.state === 'compact') {
            this.state = 'expanded';
            this.container.classList.add('expanded');
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
                this.updateStatus('Opening settings...', 2000);
                break;
            case 'restart':
                if (typeof restartVM === 'function') {
                    if (confirm('Restart Windows VM?')) {
                        restartVM();
                        this.updateStatus('Restarting VM...', 0);
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
            this.updateStatus('Entering fullscreen...', 2000);
        } else {
            document.exitFullscreen();
            this.updateStatus('Exiting fullscreen...', 2000);
        }
    }

    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        this.setAIEnabled(this.aiEnabled);
        this.updateStatus(this.aiEnabled ? 'AI assistant enabled' : 'AI assistant disabled', 2000);
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
                this.updateStatus(`Typing text...`, 2000);
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
            
            if (duration > 0 && !text.includes('Booting') && !text.includes('Loading') && !text.includes('Downloading')) {
                setTimeout(() => {
                    if (this.statusText === text && !this.isExpanded) {
                        this.collapse();
                    }
                }, duration);
            }
        }
    }

    updateProgress(percent, statusText = null, totalBytes = null, loadedBytes = null) {
        if (!this.container) return;
        
        const progressContainer = document.getElementById('island-progress-container');
        const progressBar = document.getElementById('island-progress-bar');
        const progressText = document.getElementById('island-progress-text');
        
        if (!progressContainer || !progressBar || !progressText) return;
        
        this.progress = Math.max(0, Math.min(100, percent));
        
        // Show progress bar if progress > 0
        if (this.progress > 0 && this.progress < 100) {
            progressContainer.style.display = 'block';
            progressBar.style.setProperty('--progress-width', this.progress + '%');
            
            // Calculate time remaining
            const now = Date.now();
            if (!this.progressStartTime) {
                this.progressStartTime = now;
                this.progressLastUpdate = now;
                this.progressLastValue = 0;
            }
            
            let timeRemaining = 'Calculating...';
            
            if (this.progressLastValue > 0 && this.progress > this.progressLastValue) {
                const timeDiff = now - this.progressLastUpdate;
                const progressDiff = this.progress - this.progressLastValue;
                
                if (progressDiff > 0 && timeDiff > 0) {
                    const progressPerMs = progressDiff / timeDiff;
                    const remainingProgress = 100 - this.progress;
                    const estimatedMs = remainingProgress / progressPerMs;
                    
                    if (estimatedMs > 0 && estimatedMs < 3600000) { // Less than 1 hour
                        const seconds = Math.ceil(estimatedMs / 1000);
                        if (seconds < 60) {
                            timeRemaining = `${seconds}s`;
                        } else {
                            const minutes = Math.floor(seconds / 60);
                            const secs = seconds % 60;
                            timeRemaining = `${minutes}m ${secs}s`;
                        }
                    } else {
                        timeRemaining = 'Calculating...';
                    }
                }
            }
            
            // Update status text if provided
            if (statusText) {
                this.updateStatus(statusText, 0);
            }
            
            // Show bytes info if available
            let bytesInfo = '';
            if (totalBytes && loadedBytes) {
                const loadedMB = (loadedBytes / 1024 / 1024).toFixed(1);
                const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
                bytesInfo = ` ${loadedMB}MB / ${totalMB}MB`;
            }
            
            progressText.textContent = `${Math.round(this.progress)}% • ${timeRemaining}${bytesInfo}`;
            
            this.progressLastUpdate = now;
            this.progressLastValue = this.progress;
        } else {
            // Hide progress bar when complete or not started
            progressContainer.style.display = 'none';
            if (this.progress >= 100) {
                this.progressStartTime = null;
                this.progressLastUpdate = null;
                this.progressLastValue = 0;
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
            this.updateStatus('AI assistant disabled', 2000);
            return;
        }
        
        this.updateStatus('AI thinking...', 0);
        
        const response = await this.queryAI(query);
        
        if (response) {
            const executed = await this.executeAICommand(response, this.emulator);
            
            if (executed) {
                this.updateStatus('Command executed', 2000);
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
