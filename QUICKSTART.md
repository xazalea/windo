# Quick Start Guide

Get Windows 10/11 **actually running in your browser** on Vercel using x86 emulation!

## Prerequisites Checklist

- [ ] Azure account ([Sign up free](https://azure.microsoft.com/free/))
- [ ] Azure CLI installed ([Install guide](https://docs.microsoft.com/cli/azure/install-azure-cli))
- [ ] Terraform installed ([Download](https://www.terraform.io/downloads))

## Quick Setup (Browser-Based)

### Option A: Windows on Vercel (Recommended)

**Run Windows directly in browser - no Azure needed!**

1. **Deploy to Vercel**:
```bash
cd web
vercel
```

2. **Get Windows Image**:
   - Upload to Azure Blob Storage, S3, or CDN
   - Or use BrowserPod to download
   - Or use demo Windows 3.11

3. **Run Windows**:
   - Open Vercel URL
   - Click "Run Windows on Vercel"
   - Select/upload image
   - Windows boots in browser! 🎉

### Option B: Windows on Azure VM

**For better performance, deploy to Azure:**

1. **Login to Azure**:
```bash
az login
```

2. **Configure Terraform**:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings
```

3. **Deploy Infrastructure**:
```bash
terraform init
terraform apply
```

4. **Deploy Web Interface**:
```bash
cd ../web
vercel
```

5. **Upload Setup Scripts**:
```bash
cd ../scripts
./upload-scripts.sh  # or .\upload-scripts.ps1 on Windows
```

6. **Access Windows**:
   - Open Vercel URL
   - Click "Connect to VM"
   - Enter VM IP and credentials
   - Windows desktop opens! 🎉

## What You Get

### Browser-Based (Vercel)
- ✅ **Windows 10/11 running in browser** using v86.js emulator
- ✅ No external servers needed
- ✅ Full desktop experience
- ✅ Mouse, keyboard, and clipboard support
- ✅ Image upload/URL loading
- ✅ Configurable settings

### Azure VM (Optional)
- ✅ Windows 11 Pro VM on Azure
- ✅ IIS Web Server
- ✅ RDP enabled and configured
- ✅ RDP WebSocket Gateway
- ✅ Web-based RDP viewer
- ✅ Firewall rules configured

## Troubleshooting

**VM not accessible?**
- Wait 5-10 minutes after deployment for scripts to run
- Check Azure Portal → VM → Extensions → CustomScriptExtension status

**Can't upload scripts?**
- Make sure you're logged in: `az account show`
- Check storage account exists: `az storage account list`

**Need help?**
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- Check [README.md](README.md) for architecture overview

## Next Steps

- ✅ **Windows is now running in your browser!**
- Configure SSL/HTTPS for secure connections
- Set up auto-shutdown to save costs
- Add monitoring and alerts
- Deploy multiple VMs
- See [WINDOWS_IN_BROWSER.md](WINDOWS_IN_BROWSER.md) for detailed info

## Cost Saving Tips

- Stop VM when not in use: `az vm stop --resource-group windows-vm-rg --name windows-vm`
- Use smaller VM sizes for testing
- Delete resources when done: `terraform destroy`

