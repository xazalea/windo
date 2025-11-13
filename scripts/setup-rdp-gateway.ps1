# PowerShell script to set up RDP WebSocket Gateway on Windows VM
# This enables browser-based RDP access via WebSocket

Write-Host "Setting up RDP WebSocket Gateway..." -ForegroundColor Green

# Install Node.js if not present
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
    Start-Process msiexec.exe -ArgumentList "/i $nodeInstaller /quiet /norestart" -Wait
    Remove-Item $nodeInstaller
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# Create gateway directory
$gatewayDir = "C:\rdp-gateway"
if (-not (Test-Path $gatewayDir)) {
    New-Item -ItemType Directory -Path $gatewayDir -Force | Out-Null
}

# Create package.json
$packageJson = @{
    name = "rdp-websocket-gateway"
    version = "1.0.0"
    description = "WebSocket Gateway for RDP connections"
    main = "gateway.js"
    scripts = @{
        start = "node gateway.js"
    }
    dependencies = @{
        "ws" = "^8.14.2"
        "node-rdpjs" = "^0.3.0"
    }
} | ConvertTo-Json -Depth 10

Set-Content -Path "$gatewayDir\package.json" -Value $packageJson

# Create gateway.js
$gatewayJs = @'
const WebSocket = require('ws');
const { RDPClient } = require('node-rdpjs');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`RDP WebSocket Gateway running on port ${PORT}`);

wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    let rdpClient = null;
    let connectionParams = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'connect') {
                connectionParams = data;
                connectRDP(data);
            } else if (data.type === 'mouse') {
                if (rdpClient) {
                    rdpClient.sendPointerEvent(data.x, data.y, data.button, data.action === 'down');
                }
            } else if (data.type === 'keyboard') {
                if (rdpClient) {
                    rdpClient.sendKeyEvent(data.scancode, data.action === 'down');
                }
            } else if (data.type === 'wheel') {
                if (rdpClient) {
                    rdpClient.sendWheelEvent(data.deltaX, data.deltaY);
                }
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    });

    function connectRDP(params) {
        try {
            rdpClient = new RDPClient({
                host: params.server,
                port: params.port || 3389,
                domain: '',
                userName: params.username,
                password: params.password,
                screenWidth: params.width || 1920,
                screenHeight: params.height || 1080,
                colorDepth: 24
            });

            rdpClient.on('connect', () => {
                console.log('RDP connected');
                ws.send(JSON.stringify({ type: 'connected' }));
            });

            rdpClient.on('bitmap', (bitmap) => {
                // Convert bitmap to base64
                const base64 = bitmap.toDataURL('image/png').split(',')[1];
                ws.send(JSON.stringify({
                    type: 'frame',
                    image: base64
                }));
            });

            rdpClient.on('close', () => {
                console.log('RDP disconnected');
                ws.send(JSON.stringify({ type: 'disconnected' }));
            });

            rdpClient.on('error', (error) => {
                console.error('RDP error:', error);
                ws.send(JSON.stringify({ type: 'error', message: error.message }));
            });

            rdpClient.connect();
        } catch (error) {
            console.error('RDP connection error:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    }

    ws.on('close', () => {
        console.log('WebSocket disconnected');
        if (rdpClient) {
            rdpClient.close();
        }
    });
});
'@

Set-Content -Path "$gatewayDir\gateway.js" -Value $gatewayJs

# Install dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location $gatewayDir
npm install --production

# Create Windows Service (using node-windows or pm2)
Write-Host "Setting up gateway as Windows service..." -ForegroundColor Yellow

# Create startup script
$startScript = @"
@echo off
cd /d $gatewayDir
node gateway.js
"@

Set-Content -Path "$gatewayDir\start-gateway.bat" -Value $startScript

# Create scheduled task to run on startup
$taskName = "RDPWebSocketGateway"
$taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($taskExists) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "$gatewayDir\gateway.js" -WorkingDirectory $gatewayDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "RDP WebSocket Gateway Service"

# Configure Windows Firewall
Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
$gatewayPort = 8080
New-NetFirewallRule -DisplayName "RDP WebSocket Gateway" -Direction Inbound -Protocol TCP -LocalPort $gatewayPort -Action Allow -ErrorAction SilentlyContinue

# Start the service
Write-Host "Starting RDP WebSocket Gateway..." -ForegroundColor Yellow
Start-ScheduledTask -TaskName $taskName

Write-Host ""
Write-Host "RDP WebSocket Gateway setup completed!" -ForegroundColor Green
Write-Host "Gateway is running on port $gatewayPort" -ForegroundColor Green
Write-Host "Access it from: ws://<vm-ip>:$gatewayPort/rdp" -ForegroundColor Cyan

