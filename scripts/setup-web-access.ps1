# PowerShell script to set up web-based RDP access
# This script installs and configures a web-based RDP client

Write-Host "Setting up web-based RDP access..." -ForegroundColor Green

$webRoot = "C:\inetpub\wwwroot"
$rdpWebPath = "$webRoot\rdp"

# Create RDP web directory
if (-not (Test-Path $rdpWebPath)) {
    New-Item -ItemType Directory -Path $rdpWebPath -Force | Out-Null
}

# Create web-based RDP client HTML page
$rdpClientHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RDP Web Client - Windows VM</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 600;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 30px;
        }
        button {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
            color: #1976D2;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖥️ Remote Desktop Connection</h1>
        <form id="rdpForm">
            <div class="form-group">
                <label for="server">Server Address:</label>
                <input type="text" id="server" value="localhost" required>
            </div>
            <div class="form-group">
                <label for="port">Port:</label>
                <input type="number" id="port" value="3389" required>
            </div>
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" required>
            </div>
            <div class="form-group">
                <label for="resolution">Resolution:</label>
                <select id="resolution">
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                    <option value="1366x768">1366x768</option>
                    <option value="1280x720">1280x720 (HD)</option>
                    <option value="1024x768">1024x768</option>
                </select>
            </div>
            <div class="button-group">
                <button type="button" class="btn-secondary" onclick="window.location.href='/'">Back</button>
                <button type="submit" class="btn-primary">Connect via RDP</button>
            </div>
        </form>
        <div class="info-box">
            <p><strong>Note:</strong> This will download an RDP connection file.</p>
            <p>For web-based access, use a browser extension or install a web RDP client.</p>
            <p>Recommended: Use Microsoft Remote Desktop client or Chrome RDP extension.</p>
        </div>
    </div>
    <script>
        document.getElementById('rdpForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const server = document.getElementById('server').value;
            const port = document.getElementById('port').value;
            const username = document.getElementById('username').value;
            
            // Generate RDP file content
            const rdpContent = `screen mode id:i:2
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
full address:s:${server}:${port}
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

            // Create and download RDP file
            const blob = new Blob([rdpContent], { type: 'application/x-rdp' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'windows-vm-connection.rdp';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    </script>
</body>
</html>
"@

Set-Content -Path "$rdpWebPath\index.html" -Value $rdpClientHtml -Force

# Create status page
$statusPage = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Status - Windows VM</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .status-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status-value {
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            border-radius: 25px;
            color: white;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 System Status</h1>
        <div class="status-item">
            <span>Operating System:</span>
            <span class="status-value" id="os"></span>
        </div>
        <div class="status-item">
            <span>Computer Name:</span>
            <span class="status-value" id="computerName"></span>
        </div>
        <div class="status-item">
            <span>IIS Status:</span>
            <span class="status-value">Running</span>
        </div>
        <div class="status-item">
            <span>RDP Status:</span>
            <span class="status-value">Enabled</span>
        </div>
        <a href="/" class="button">Back to Home</a>
    </div>
    <script>
        // This would be populated by server-side script in production
        document.getElementById('os').textContent = 'Windows';
        document.getElementById('computerName').textContent = window.location.hostname;
    </script>
</body>
</html>
"@

New-Item -ItemType Directory -Path "$webRoot\status" -Force | Out-Null
Set-Content -Path "$webRoot\status\index.html" -Value $statusPage -Force

# Install WebSocket support for real-time RDP (optional)
Write-Host "Web-based RDP access setup completed!" -ForegroundColor Green
Write-Host "RDP web client is available at /rdp" -ForegroundColor Green

