# PowerShell script to upload setup scripts to Azure Storage
# This script should be run after Terraform deployment

Write-Host "Uploading setup scripts to Azure Storage..." -ForegroundColor Green

# Get storage account name from Terraform output
$terraformDir = Join-Path $PSScriptRoot "..\terraform"
$terraformState = Join-Path $terraformDir "terraform.tfstate"

if (-not (Test-Path $terraformState)) {
    Write-Host "Error: Terraform state not found. Please run 'terraform apply' first." -ForegroundColor Red
    exit 1
}

# Change to terraform directory to run terraform output
Push-Location $terraformDir
try {
    $storageAccount = terraform output -raw storage_account_name 2>$null
    if (-not $storageAccount) {
        Write-Host "Error: Could not determine storage account name from Terraform output." -ForegroundColor Red
        Write-Host "Please run: cd terraform && terraform output storage_account_name" -ForegroundColor Yellow
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host "Storage Account: $storageAccount" -ForegroundColor Cyan

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Azure CLI not found. Please install it from https://docs.microsoft.com/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    az account show | Out-Null
} catch {
    Write-Host "Please login to Azure..." -ForegroundColor Yellow
    az login
}

# Upload scripts
$scripts = @(
    "setup-iis.ps1",
    "setup-rdp.ps1",
    "setup-web-access.ps1",
    "setup-rdp-gateway.ps1"
)

foreach ($script in $scripts) {
    $scriptPath = Join-Path $PSScriptRoot $script
    if (-not (Test-Path $scriptPath)) {
        Write-Host "Warning: Script $script not found, skipping..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Uploading $script..." -ForegroundColor Yellow
    az storage blob upload `
        --account-name $storageAccount `
        --container-name scripts `
        --name $script `
        --file $scriptPath `
        --overwrite
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $script uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to upload $script" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✓ All scripts uploaded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "The Custom Script Extension will automatically run these scripts on the VM." -ForegroundColor Cyan
Write-Host "You can check the extension status in Azure Portal or run:" -ForegroundColor Cyan
Write-Host "  az vm extension show --resource-group <rg-name> --vm-name <vm-name> --name CustomScriptExtension" -ForegroundColor Yellow

