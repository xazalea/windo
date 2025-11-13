output "vm_public_ip" {
  description = "Public IP address of the Windows VM"
  value       = azurerm_public_ip.main.ip_address
}

output "vm_name" {
  description = "Name of the Windows VM"
  value       = azurerm_windows_virtual_machine.main.name
}

output "rdp_connection_string" {
  description = "RDP connection string"
  value       = "mstsc /v:${azurerm_public_ip.main.ip_address}"
}

output "web_access_url" {
  description = "URL to access the web interface"
  value       = "http://${azurerm_public_ip.main.ip_address}"
}

output "admin_username" {
  description = "Administrator username"
  value       = var.admin_username
  sensitive   = false
}

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.main.name
}

output "storage_account_name" {
  description = "Storage account name for scripts"
  value       = azurerm_storage_account.main.name
}

