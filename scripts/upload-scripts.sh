#!/bin/bash
# Helper script to upload PowerShell setup scripts to Azure Storage
# This script should be run after Terraform deployment

set -e

echo "Uploading setup scripts to Azure Storage..."

# Get storage account name from Terraform output
if [ -f "../terraform/terraform.tfstate" ]; then
    STORAGE_ACCOUNT=$(cd ../terraform && terraform output -raw storage_account_name 2>/dev/null || echo "")
else
    echo "Error: Terraform state not found. Please run 'terraform apply' first."
    exit 1
fi

if [ -z "$STORAGE_ACCOUNT" ]; then
    echo "Error: Could not determine storage account name from Terraform output."
    echo "Please run: cd ../terraform && terraform output storage_account_name"
    exit 1
fi

echo "Storage Account: $STORAGE_ACCOUNT"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI not found. Please install it from https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi

# Upload scripts
echo "Uploading setup-iis.ps1..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --container-name scripts \
    --name setup-iis.ps1 \
    --file setup-iis.ps1 \
    --overwrite

echo "Uploading setup-rdp.ps1..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --container-name scripts \
    --name setup-rdp.ps1 \
    --file setup-rdp.ps1 \
    --overwrite

echo "Uploading setup-web-access.ps1..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --container-name scripts \
    --name setup-web-access.ps1 \
    --file setup-web-access.ps1 \
    --overwrite

echo "Uploading setup-rdp-gateway.ps1..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --container-name scripts \
    --name setup-rdp-gateway.ps1 \
    --file setup-rdp-gateway.ps1 \
    --overwrite

echo ""
echo "✓ All scripts uploaded successfully!"
echo ""
echo "The Custom Script Extension will automatically run these scripts on the VM."
echo "You can check the extension status in Azure Portal or run:"
echo "  az vm extension show --resource-group <rg-name> --vm-name <vm-name> --name CustomScriptExtension"

