// VM Management Application JavaScript

// Sample VM data (in production, this would come from an API)
let vms = [
    {
        id: 1,
        name: 'windows-vm-01',
        ip: '20.123.45.67',
        status: 'running',
        os: 'Windows 11 Pro',
        size: 'Standard_D2s_v3',
        region: 'eastus'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderVMList();
    setupFormHandlers();
    setupKeyboardShortcuts();
});

// Open Azalea (Windows on Vercel)
function openAzalea() {
    // Check if terms accepted, if not redirect to terms page
    if (localStorage.getItem('azalea_terms_accepted') !== 'true') {
        window.location.href = '/terms.html';
    } else {
        window.location.href = '/windows-emulator.html';
    }
}

// Render VM list
function renderVMList() {
    const vmItems = document.getElementById('vmItems');
    if (vms.length === 0) {
        vmItems.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h3>No virtual machines yet</h3>
                <p>Click "Deploy New VM" to create your first Windows virtual machine</p>
            </div>
        `;
        return;
    }

    vmItems.innerHTML = vms.map(vm => `
        <div class="vm-item">
            <div class="vm-item-info">
                <h3>${escapeHtml(vm.name)}</h3>
                <p>
                    <span class="status-indicator status-${vm.status}"></span>
                    <span>${vm.status.toUpperCase()}</span>
                    <span style="margin: 0 0.5rem;">•</span>
                    <span>${escapeHtml(vm.os)}</span>
                    <span style="margin: 0 0.5rem;">•</span>
                    <span>IP: ${escapeHtml(vm.ip)}</span>
                </p>
            </div>
            <div class="vm-item-actions">
                <button class="btn-small btn-connect" onclick="connectToVM('${escapeHtml(vm.ip)}')" title="Connect">
                    Connect
                </button>
                <button class="btn-small btn-delete" onclick="deleteVMById(${vm.id})" title="Delete">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Show deploy modal
function showDeployModal() {
    const modal = document.getElementById('deployModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Show connect modal
function showConnectModal() {
    const modal = document.getElementById('connectModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Show manage modal
function showManageModal() {
    const modal = document.getElementById('manageModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form if it's the deploy modal
    if (modalId === 'deployModal') {
        document.getElementById('deployForm').reset();
    }
}

// Close modal when clicking outside or pressing Escape
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-backdrop')) {
        const modal = event.target.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

// Setup form handlers
function setupFormHandlers() {
    const deployForm = document.getElementById('deployForm');
    if (deployForm) {
        deployForm.addEventListener('submit', function(e) {
            e.preventDefault();
            deployVM();
        });
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + K to open deploy modal
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            showDeployModal();
        }
    });
}

// Deploy VM
function deployVM() {
    const vmData = {
        name: document.getElementById('vmName').value.trim(),
        size: document.getElementById('vmSize').value,
        windowsVersion: document.getElementById('windowsVersion').value,
        adminUsername: document.getElementById('adminUsername').value.trim(),
        adminPassword: document.getElementById('adminPassword').value,
        region: document.getElementById('region').value
    };

    // Validate
    if (!vmData.name || !vmData.adminUsername || !vmData.adminPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // In production, this would make an API call to trigger Terraform
    console.log('Deploying VM with data:', { ...vmData, adminPassword: '***' });
    
    showToast('VM deployment initiated! Check Terraform output for the VM IP address.', 'success');
    
    // Simulate adding a new VM (in production, this would come from the API)
    // vms.push({
    //     id: vms.length + 1,
    //     name: vmData.name,
    //     ip: 'Pending...',
    //     status: 'pending',
    //     os: vmData.windowsVersion.includes('win11') ? 'Windows 11 Pro' : 'Windows 10 Pro',
    //     size: vmData.size,
    //     region: vmData.region
    // });
    // renderVMList();
    
    closeModal('deployModal');
}

// Connect to VM via RDP
function connectRDP() {
    const vmIp = document.getElementById('vmIp').value.trim() || 'localhost';
    const username = document.getElementById('rdpUsername').value.trim();
    
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }

    // Generate RDP file
    const rdpContent = generateRDPFile(vmIp, username);
    downloadRDPFile(rdpContent, `${vmIp}-connection.rdp`);
    
    showToast('RDP file downloaded successfully', 'success');
    closeModal('connectModal');
}

// Connect via Web RDP
function connectWebRDP() {
    const vmIp = document.getElementById('vmIp').value.trim() || 'localhost';
    const username = document.getElementById('rdpUsername').value.trim();
    
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }

    // Open RDP viewer in new window
    const url = `/rdp-viewer.html?server=${encodeURIComponent(vmIp)}&username=${encodeURIComponent(username)}`;
    window.open(url, '_blank', 'width=1200,height=800');
    
    showToast('Opening Windows desktop in browser...', 'success');
    closeModal('connectModal');
}

// Connect to specific VM
function connectToVM(ip) {
    document.getElementById('vmIp').value = ip;
    showConnectModal();
}

// Generate RDP file content
function generateRDPFile(server, username) {
    return `screen mode id:i:2
use multimon:i:0
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
winposstr:s:0,1,0,0,800,600
compression:i:1
keyboardhook:i:2
audiocapturemode:i:0
videoplaybackmode:i:1
connection type:i:7
networkautodetect:i:1
bandwidthautodetect:i:1
enableworkspacereconnect:i:0
disable wallpaper:i:0
allow font smoothing:i:0
allow desktop composition:i:1
disable full window drag:i:1
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
full address:s:${server}:3389
audiomode:i:0
redirectprinters:i:1
redirectcomports:i:0
redirectsmartcards:i:1
redirectclipboard:i:1
redirectposdevices:i:0
autoreconnection enabled:i:1
authentication level:i:2
prompt for credentials:i:0
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:
gatewayusagemethod:i:4
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:0
promptcredentialonce:i:0
gatewaybrokeringtype:i:0
use redirection server name:i:0
rdgiskdcproxy:i:0
kdcproxyname:s:
username:s:${username}`;
}

// Download RDP file
function downloadRDPFile(content, filename) {
    const blob = new Blob([content], { type: 'application/x-rdp' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Show status
function showStatus() {
    if (vms.length === 0) {
        showToast('No virtual machines found', 'warning');
        return;
    }
    
    const statusText = vms.map(vm => 
        `${vm.name}: ${vm.status.toUpperCase()} - ${vm.ip}`
    ).join('\n');
    
    // In a real app, this would show a detailed status modal
    showToast(`${vms.length} VM(s) found. Check the list below.`, 'success');
}

// Refresh VM list
function refreshVMList() {
    showToast('Refreshing VM list...', 'success');
    // In production, this would fetch from API
    renderVMList();
}

// Restart VM
function restartVM() {
    if (confirm('Are you sure you want to restart the VM? This may cause temporary downtime.')) {
        showToast('VM restart initiated', 'success');
        closeModal('manageModal');
    }
}

// Stop VM
function stopVM() {
    if (confirm('Are you sure you want to stop the VM? You will need to start it again to access it.')) {
        showToast('VM stop initiated', 'success');
        closeModal('manageModal');
    }
}

// Delete VM
function deleteVM() {
    if (confirm('⚠️ Are you sure you want to delete the VM? This action cannot be undone and all data will be lost.')) {
        showToast('VM deletion initiated', 'success');
        closeModal('manageModal');
    }
}

// Delete VM by ID
function deleteVMById(id) {
    const vm = vms.find(v => v.id === id);
    if (!vm) return;
    
    if (confirm(`⚠️ Are you sure you want to delete "${vm.name}"? This action cannot be undone.`)) {
        vms = vms.filter(v => v.id !== id);
        renderVMList();
        showToast(`VM "${vm.name}" deleted`, 'success');
    }
}

// Toast notification system
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 4000);
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
