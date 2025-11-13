// BrowserPod Integration for running dev scripts in browser
// This allows downloading and running v86.js from within the browser environment

class BrowserPodManager {
    constructor() {
        this.pod = null;
        this.scripts = [];
        this.v86Loaded = false;
    }

    async initialize() {
        // Initialize BrowserPod environment
        // BrowserPod runs containers in the browser using WebAssembly
        try {
            // Check if we're in a BrowserPod environment or can use fetch/WebAssembly
            if (typeof window.BrowserPod !== 'undefined') {
                this.pod = new window.BrowserPod();
                await this.pod.initialize();
                return true;
            }
            // Fallback: Use native browser APIs (fetch, WebAssembly)
            // This works even without BrowserPod library
            return true;
        } catch (error) {
            console.error('BrowserPod initialization failed:', error);
            return false;
        }
    }

    async downloadV86() {
        // Download v86.js using BrowserPod or native fetch
        const v86Sources = [
            'https://unpkg.com/v86@0.9.0/build/libv86.js',
            'https://cdn.jsdelivr.net/npm/v86@0.9.0/build/libv86.js',
            'https://raw.githubusercontent.com/copy/v86/master/build/libv86.js'
        ];

        for (const url of v86Sources) {
            try {
                console.log('Attempting to download v86.js from:', url);
                
                if (this.pod) {
                    // Use BrowserPod to download (no CORS issues)
                    const script = `
                        curl -L "${url}" -o /tmp/libv86.js
                        cat /tmp/libv86.js
                    `;
                    const result = await this.pod.execute(script);
                    return result.stdout || result;
                } else {
                    // Use native fetch (may have CORS issues, but try anyway)
                    const response = await fetch(url, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'default'
                    });
                    
                    if (response.ok) {
                        const text = await response.text();
                        return text;
                    }
                }
            } catch (error) {
                console.warn(`Failed to download from ${url}:`, error.message);
                continue;
            }
        }
        
        throw new Error('Failed to download v86.js from all sources');
    }

    async loadV86FromBrowserPod() {
        // Download and execute v86.js using BrowserPod
        try {
            if (!this.v86Loaded) {
                console.log('Downloading v86.js via BrowserPod...');
                const v86Code = await this.downloadV86();
                
                // Execute the downloaded code
                if (v86Code) {
                    // Create a script element and inject the code
                    const script = document.createElement('script');
                    script.textContent = v86Code;
                    document.head.appendChild(script);
                    
                    // Wait for V86Starter to be available
                    let attempts = 0;
                    const maxAttempts = 50;
                    
                    return new Promise((resolve, reject) => {
                        const checkV86 = setInterval(() => {
                            if (typeof V86Starter !== 'undefined') {
                                clearInterval(checkV86);
                                console.log('✓ v86.js loaded successfully via BrowserPod');
                                this.v86Loaded = true;
                                resolve();
                            } else if (attempts++ >= maxAttempts) {
                                clearInterval(checkV86);
                                reject(new Error('V86Starter not available after loading'));
                            }
                        }, 100);
                    });
                } else {
                    throw new Error('v86.js code is empty');
                }
            } else {
                return Promise.resolve();
            }
        } catch (error) {
            console.error('Failed to load v86.js via BrowserPod:', error);
            throw error;
        }
    }

    async runDevScript(script) {
        // Run development scripts in BrowserPod
        if (!this.pod) {
            await this.initialize();
        }

        if (!this.pod) {
            throw new Error('BrowserPod not available');
        }

        // Execute script in BrowserPod container
        const result = await this.pod.execute(script);
        return result;
    }

    async createVMFromScript(vmConfig) {
        // Create a VM using Terraform scripts run in BrowserPod
        const terraformScript = this.generateTerraformScript(vmConfig);
        
        // Run Terraform in BrowserPod
        const result = await this.runDevScript(terraformScript);
        
        return result;
    }

    generateTerraformScript(config) {
        // Generate Terraform script for VM creation
        return `
# Terraform script generated in BrowserPod
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "${config.resourceGroup}"
  location = "${config.location}"
}

resource "azurerm_windows_virtual_machine" "main" {
  name                = "${config.vmName}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = "${config.vmSize}"
  admin_username      = "${config.adminUsername}"
  admin_password      = "${config.adminPassword}"

  network_interface_ids = [azurerm_network_interface.main.id]

  os_disk {
    name                 = "${config.vmName}-os-disk"
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "${config.imagePublisher}"
    offer     = "${config.imageOffer}"
    sku       = "${config.imageSku}"
    version   = "latest"
  }
}

output "vm_public_ip" {
  value = azurerm_public_ip.main.ip_address
}
        `;
    }

    async downloadWindowsImage() {
        // Download Windows image for browser emulation
        // This runs in BrowserPod to avoid CORS issues
        const downloadScript = `
# Download Windows image
wget -O windows.img "${this.getWindowsImageUrl()}"
        `;
        
        return await this.runDevScript(downloadScript);
    }

    getWindowsImageUrl() {
        // Get Windows image URL (could be from Azure, S3, etc.)
        // For demo, using a placeholder
        return 'https://example.com/windows11.img';
    }

    // Alternative: Use fetch with BrowserPod proxy
    async fetchWithBrowserPod(url) {
        if (this.pod) {
            const script = `curl -L "${url}"`;
            const result = await this.pod.execute(script);
            return result.stdout || result;
        } else {
            // Fallback to native fetch
            const response = await fetch(url);
            return await response.text();
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserPodManager;
}

