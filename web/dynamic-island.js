// Advanced Dynamic Island Component - Replaces Toolbar
// Clean, bug-free, and perfectly positioned
class DynamicIsland {
    constructor() {
        this.container = null;
        this.statusText = '';
        this.isExpanded = false;
        this.isVisible = true;
        this.aiEnabled = true;
        this.aiHistory = [];
        this.emulator = null;
        this.state = 'compact'; // 'compact', 'expanded'
        this.progress = 0;
        this.progressStartTime = null;
        this.progressLastUpdate = null;
        this.progressLastValue = 0;
        this.autoHideTimeout = null;
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
        
        // Control buttons with correct Lucide icons
        const controls = [
            { 
                // Settings icon (gear)
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`, 
                action: 'settings', 
                title: 'Settings (S)' 
            },
            { 
                // Restart icon (refresh)
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>`, 
                action: 'restart', 
                title: 'Restart VM (R)' 
            },
            { 
                // Fullscreen icon (maximize)
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`, 
                action: 'fullscreen', 
                title: 'Fullscreen (F11)' 
            },
            { 
                // AI icon (sparkles)
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`, 
                action: 'ai', 
                title: 'AI Assistant' 
            },
            { 
                // Close/minimize icon (minimize)
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
        
        // Event listeners - improved to prevent conflicts
        let hoverTimeout = null;
        this.container.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            if (!this.isExpanded) {
                this.expand();
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                if (!this.isExpanded) {
                    this.collapse();
                }
            }, 300); // Small delay to allow moving to controls
        });
        
        this.container.addEventListener('click', (e) => {
            // Only toggle if clicking on main content, not buttons
            if (e.target === this.container || e.target.closest('.island-main')) {
                e.stopPropagation();
                this.toggleExpanded();
            }
        });
        
        // Prevent clicks from reaching canvas
        this.container.addEventListener('mousedown', (e) => e.stopPropagation());
        this.container.addEventListener('mouseup', (e) => e.stopPropagation());
        
        document.body.appendChild(this.container);
        this.initAI();
        this.positionTopCenter();
        
        // Auto-hide when idle (after 5 seconds of no activity)
        this.startAutoHide();
    }

    positionTopCenter() {
        this.container.style.top = '16px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.right = 'auto';
    }

    expand() {
        if (this.state === 'compact') {
            this.state = 'expanded';
            this.container.classList.add('expanded');
            clearTimeout(this.autoHideTimeout);
            
            // Show controls with slight delay for smooth animation
            setTimeout(() => {
                const controls = document.getElementById('island-controls');
                if (controls) {
                    controls.style.display = 'flex';
                }
            }, 150);
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
            this.startAutoHide();
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

    startAutoHide() {
        clearTimeout(this.autoHideTimeout);
        // Auto-hide after 5 seconds if not expanded and no progress
        this.autoHideTimeout = setTimeout(() => {
            if (!this.isExpanded && this.progress === 0 && !this.container.matches(':hover')) {
                this.container.style.opacity = '0.6';
            }
        }, 5000);
    }

    handleAction(action) {
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        switch(action) {
            case 'settings':
                if (typeof showSettings === 'function') {
                    showSettings();
                    this.updateStatus('Settings', 2000);
                } else {
                    this.updateStatus('Settings unavailable', 2000);
                }
                break;
            case 'restart':
                if (typeof restartVM === 'function') {
                    if (confirm('Restart Windows VM? This will reset the current session.')) {
                        restartVM();
                        this.updateStatus('Restarting...', 0);
                    }
                } else {
                    this.updateStatus('Restart unavailable', 2000);
                }
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'ai':
                this.toggleAI();
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
                this.updateStatus('Fullscreen unavailable', 2000);
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
            
            // Auto-collapse only for non-critical status updates
            if (duration > 0 && !text.includes('Booting') && !text.includes('Loading') && !text.includes('Downloading') && !text.includes('Restarting')) {
                setTimeout(() => {
                    if (this.statusText === text && !this.isExpanded) {
                        this.startAutoHide();
                    }
                }, duration);
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
        
        // Show progress bar if progress > 0 and < 100
        if (this.progress > 0 && this.progress < 100) {
            progressContainer.style.display = 'flex';
            progressBar.style.setProperty('--progress-width', this.progress + '%');
            
            // Calculate time remaining
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
            
            // Update status text if provided
            if (statusText) {
                this.updateStatus(statusText, 0);
            }
            
            // Show bytes info if available
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
            
            this.progressLastUpdate = now;
            this.progressLastValue = this.progress;
        } else {
            // Hide progress bar when complete or not started
            progressContainer.style.display = 'none';
            if (this.progress >= 100) {
                this.progressStartTime = null;
                this.progressLastUpdate = null;
                this.progressLastValue = 0;
                this.startAutoHide();
            }
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
