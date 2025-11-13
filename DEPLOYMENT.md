# Deployment Guide

This guide walks you through deploying a Windows 10/11 VM accessible via web browser.

## Prerequisites

1. **Azure Account**: Sign up at [azure.com](https://azure.com) if you don't have one
2. **Azure CLI**: Install from [docs.microsoft.com](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Terraform**: Install from [terraform.io](https://www.terraform.io/downloads)
4. **PowerShell**: Required for Windows setup scripts

## Step 1: Azure Authentication

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"

# Verify
az account show
```

## Step 2: Configure Terraform

1. Navigate to the terraform directory:
```bash
cd terraform
```

2. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

3. Edit `terraform.tfvars` with your settings:
```hcl
resource_group_name = "windows-vm-rg"
location           = "eastus"
vm_name            = "my-windows-vm"
vm_size            = "Standard_D2s_v3"

admin_username = "adminuser"
admin_password = "YourSecurePassword123!" # Change this!

image_publisher = "MicrosoftWindowsDesktop"
image_offer      = "Windows-11"
image_sku        = "win11-21h2-pro"
```

## Step 3: Initialize Terraform

```bash
terraform init
```

This downloads the required providers (Azure RM).

## Step 4: Review Deployment Plan

```bash
terraform plan
```

Review the resources that will be created:
- Resource Group
- Virtual Network and Subnet
- Network Security Group (with RDP, HTTP, HTTPS rules)
- Public IP Address
- Network Interface
- Windows Virtual Machine
- Storage Account
- Custom Script Extension

## Step 5: Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will take approximately 10-15 minutes.

## Step 6: Access Your VM

After deployment completes, Terraform will output:

```
vm_public_ip = "20.123.45.67"
web_access_url = "http://20.123.45.67"
rdp_connection_string = "mstsc /v:20.123.45.67"
```

### Option 1: Web Interface

Open your browser and navigate to:
```
http://<vm_public_ip>
```

You should see the Windows VM Web Access page.

### Option 2: RDP Connection

1. **Windows**: Use Remote Desktop Connection
   - Press `Win + R`
   - Type: `mstsc`
   - Enter the IP address from Terraform output
   - Use the admin username and password

2. **Mac/Linux**: Use Microsoft Remote Desktop app or RDP client
   - Download from Mac App Store or use `rdesktop` command

3. **Web RDP**: Navigate to `http://<vm_public_ip>/rdp`

## Step 7: Upload Setup Scripts (Manual Step)

The Custom Script Extension needs the PowerShell scripts in Azure Storage. You have two options:

### Option A: Using Helper Script (Recommended)

**On Linux/Mac:**
```bash
cd scripts
./upload-scripts.sh
```

**On Windows (PowerShell):**
```powershell
cd scripts
.\upload-scripts.ps1
```

The helper script will automatically:
- Get the storage account name from Terraform output
- Check Azure CLI authentication
- Upload all three setup scripts

### Option B: Manual Upload

If the helper script doesn't work, you can upload manually:

```bash
# From the project root
cd scripts

# Login to Azure
az login

# Get storage account name from Terraform output
STORAGE_ACCOUNT=$(cd ../terraform && terraform output -raw storage_account_name)

# Upload scripts
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name scripts --name setup-iis.ps1 --file setup-iis.ps1 --overwrite
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name scripts --name setup-rdp.ps1 --file setup-rdp.ps1 --overwrite
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name scripts --name setup-web-access.ps1 --file setup-web-access.ps1 --overwrite
```

### Option C: Manual Script Execution

If the Custom Script Extension doesn't work, you can manually run the scripts:

1. RDP into the VM
2. Copy the PowerShell scripts to the VM
3. Run them as Administrator:
```powershell
.\setup-iis.ps1
.\setup-rdp.ps1
.\setup-web-access.ps1
```

## Step 8: Access Web Management Portal

The web management portal is in the `web/` directory. You can:

1. **Host it locally**: Open `web/index.html` in a browser
2. **Host on a web server**: Deploy to Azure Static Web Apps, AWS S3, or any web host
3. **Host on the VM**: Copy files to `C:\inetpub\wwwroot\portal\`

## Troubleshooting

### VM Not Accessible

1. Check Network Security Group rules:
```bash
az network nsg rule list --resource-group windows-vm-rg --nsg-name windows-vm-nsg
```

2. Check VM status:
```bash
az vm show --resource-group windows-vm-rg --name windows-vm --show-details
```

### IIS Not Running

1. RDP into the VM
2. Open PowerShell as Administrator
3. Check IIS status:
```powershell
Get-Service W3SVC
```

4. Start IIS if needed:
```powershell
Start-Service W3SVC
```

### RDP Connection Issues

1. Verify RDP is enabled:
```powershell
Get-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -name "fDenyTSConnections"
```

2. Check Windows Firewall:
```powershell
Get-NetFirewallRule -DisplayGroup "Remote Desktop"
```

### Custom Script Extension Failed

1. Check extension status:
```bash
az vm extension show --resource-group windows-vm-rg --vm-name windows-vm --name CustomScriptExtension
```

2. View logs in Azure Portal:
   - Navigate to VM → Extensions → CustomScriptExtension → View detailed status

## Cleanup

To destroy all resources:

```bash
cd terraform
terraform destroy
```

Type `yes` when prompted. This will delete all created resources.

## Cost Estimation

For a `Standard_D2s_v3` VM (2 vCPU, 8GB RAM):
- **Compute**: ~$0.096/hour (~$70/month if running 24/7)
- **Storage**: ~$0.17/GB/month
- **Network**: ~$0.05/GB outbound

**Total estimated cost**: ~$80-100/month for continuous operation

To reduce costs:
- Stop the VM when not in use: `az vm stop --resource-group windows-vm-rg --name windows-vm`
- Use smaller VM sizes for testing
- Delete resources when done

## Security Best Practices

1. **Change Default Password**: Immediately change the admin password after first login
2. **Use Key Vault**: Store passwords in Azure Key Vault instead of Terraform variables
3. **Restrict RDP Access**: Update NSG rules to allow only your IP address
4. **Enable HTTPS**: Configure SSL certificate for web access
5. **Regular Updates**: Keep Windows and IIS updated
6. **Firewall Rules**: Review and restrict unnecessary ports

## Next Steps

- Configure SSL/TLS certificates for HTTPS
- Set up automated backups
- Configure monitoring and alerts
- Integrate with Azure Active Directory
- Set up auto-shutdown schedules
- Configure load balancing for multiple VMs

## Support

For issues or questions:
- Check Terraform documentation: https://www.terraform.io/docs
- Azure documentation: https://docs.microsoft.com/azure
- Open an issue on GitHub

