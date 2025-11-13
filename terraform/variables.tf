variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "windows-vm-rg"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "vm_name" {
  description = "Name of the Windows VM"
  type        = string
  default     = "windows-vm"
}

variable "vm_size" {
  description = "Size of the VM"
  type        = string
  default     = "Standard_D2s_v3" # 2 vCPUs, 8 GB RAM
}

variable "admin_username" {
  description = "Administrator username for the VM"
  type        = string
  default     = "adminuser"
}

variable "admin_password" {
  description = "Administrator password for the VM"
  type        = string
  sensitive   = true
  # Set via environment variable or terraform.tfvars
}

variable "image_publisher" {
  description = "Windows image publisher"
  type        = string
  default     = "MicrosoftWindowsDesktop"
}

variable "image_offer" {
  description = "Windows image offer"
  type        = string
  default     = "Windows-11"
  # Alternatives:
  # - "Windows-10" for Windows 10
  # - "WindowsServer" for Windows Server
}

variable "image_sku" {
  description = "Windows image SKU"
  type        = string
  default     = "win11-21h2-pro"
  # Alternatives:
  # - "win10-21h2-pro" for Windows 10 Pro
  # - "2022-Datacenter" for Windows Server 2022
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "Development"
    Project     = "Windows-VM-Web"
  }
}

