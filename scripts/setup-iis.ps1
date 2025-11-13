# PowerShell script to install and configure IIS
# This script is executed via Azure VM Custom Script Extension

Write-Host "Starting IIS installation and configuration..." -ForegroundColor Green

# Install IIS with required features
Write-Host "Installing IIS..." -ForegroundColor Yellow
Install-WindowsFeature -name Web-Server -IncludeManagementTools
Install-WindowsFeature -name Web-WebServer
Install-WindowsFeature -name Web-Common-Http
Install-WindowsFeature -name Web-Default-Doc
Install-WindowsFeature -name Web-Dir-Browsing
Install-WindowsFeature -name Web-Http-Errors
Install-WindowsFeature -name Web-Static-Content
Install-WindowsFeature -name Web-Http-Logging
Install-WindowsFeature -name Web-Request-Monitor
Install-WindowsFeature -name Web-Performance
Install-WindowsFeature -name Web-Stat-Compression
Install-WindowsFeature -name Web-Dyn-Compression
Install-WindowsFeature -name Web-Security
Install-WindowsFeature -name Web-Filtering
Install-WindowsFeature -name Web-Mgmt-Console
Install-WindowsFeature -name Web-Mgmt-Tools
Install-WindowsFeature -name Web-Mgmt-Service

# Install ASP.NET (for web applications)
Install-WindowsFeature -name Web-Asp-Net45
Install-WindowsFeature -name Web-Net-Ext45

# Configure Windows Firewall to allow HTTP and HTTPS
Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "Allow WebSocket" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow

# Create default web page
$webRoot = "C:\inetpub\wwwroot"
$defaultPage = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Windows VM - Web Access</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        h1 {
            margin: 0 0 20px 0;
            font-size: 2.5em;
        }
        .status {
            background: rgba(76, 175, 80, 0.3);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .info {
            margin: 15px 0;
            font-size: 1.1em;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 10px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            border-radius: 25px;
            color: white;
            text-decoration: none;
            transition: all 0.3s;
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🪟 Windows VM Web Access</h1>
        <div class="status">
            <strong>✓ IIS Server is Running</strong>
        </div>
        <div class="info">
            <p>Windows Virtual Machine is ready for web access.</p>
            <p>Use the RDP client or web-based interface to connect.</p>
        </div>
        <div>
            <a href="/rdp" class="button">RDP Web Client</a>
            <a href="/status" class="button">System Status</a>
        </div>
    </div>
</body>
</html>
"@

Set-Content -Path "$webRoot\index.html" -Value $defaultPage -Force

# Set IIS permissions
Write-Host "Setting IIS permissions..." -ForegroundColor Yellow
icacls $webRoot /grant "IIS_IUSRS:(OI)(CI)F" /T

# Restart IIS
Write-Host "Restarting IIS..." -ForegroundColor Yellow
iisreset

Write-Host "IIS installation and configuration completed successfully!" -ForegroundColor Green
Write-Host "Web server is now accessible at http://localhost" -ForegroundColor Green

