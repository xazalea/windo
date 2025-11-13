# PowerShell script to configure Remote Desktop Protocol (RDP)
# This script enables RDP and configures it for web access

Write-Host "Configuring Remote Desktop Protocol (RDP)..." -ForegroundColor Green

# Enable RDP
Write-Host "Enabling RDP..." -ForegroundColor Yellow
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -name "fDenyTSConnections" -Value 0

# Enable RDP through Windows Firewall
Write-Host "Configuring Windows Firewall for RDP..." -ForegroundColor Yellow
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Set RDP authentication level (Network Level Authentication)
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "UserAuthentication" -Value 1

# Allow RDP connections from any network
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "SecurityLayer" -Value 1

# Configure RDP port (default 3389)
$rdpPort = 3389
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\Wds\rdpwd\Tds\tcp' -name "PortNumber" -Value $rdpPort
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "PortNumber" -Value $rdpPort

# Update firewall rule for RDP port
New-NetFirewallRule -DisplayName "Remote Desktop" -Direction Inbound -Protocol TCP -LocalPort $rdpPort -Action Allow -ErrorAction SilentlyContinue

# Enable Remote Desktop Users group
Write-Host "Configuring Remote Desktop Users group..." -ForegroundColor Yellow
$rdpGroup = [ADSI]"WinNT://./Remote Desktop Users,group"
$adminUser = $env:USERNAME
try {
    $rdpGroup.Add("WinNT://$env:COMPUTERNAME/$adminUser")
    Write-Host "Added $adminUser to Remote Desktop Users group" -ForegroundColor Green
} catch {
    Write-Host "User may already be in Remote Desktop Users group" -ForegroundColor Yellow
}

# Configure RDP settings for better performance
Write-Host "Optimizing RDP settings..." -ForegroundColor Yellow
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "MaxDisconnectionTime" -Value 0
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "MaxConnectionTime" -Value 0
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "MaxIdleTime" -Value 0

# Set color depth and resolution
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "MaxMonitors" -Value 4
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "MaxXResolution" -Value 3840
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "MaxYResolution" -Value 2160

Write-Host "RDP configuration completed successfully!" -ForegroundColor Green
Write-Host "RDP is enabled on port $rdpPort" -ForegroundColor Green

