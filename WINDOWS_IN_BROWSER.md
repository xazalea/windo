# Running Windows 10/11 in Your Browser on Vercel

This project enables you to **actually run Windows 10 or 11 in your web browser** through Vercel. Here's how it works:

## Architecture

```
┌─────────────────┐
│  Vercel (Web)   │  ← Your web interface (static site)
│  rdp-viewer.html │  ← RDP client running in browser
└────────┬────────┘
         │ WebSocket
         │ Connection
         ▼
┌─────────────────┐
│  Azure VM       │  ← Windows 10/11 running here
│  RDP Gateway    │  ← WebSocket to RDP bridge (port 8080)
│  (Port 8080)    │
└────────┬────────┘
         │ RDP Protocol
         ▼
┌─────────────────┐
│  Windows Desktop│  ← Actual Windows OS
└─────────────────┘
```

## How It Works

1. **Vercel hosts the web interface** - Your management portal and RDP viewer
2. **Azure VM runs Windows** - Full Windows 10/11 operating system
3. **RDP Gateway bridges the connection** - Converts WebSocket (browser) to RDP (Windows)
4. **Browser displays Windows desktop** - You see and interact with Windows in your browser

## Setup Instructions

### Step 1: Deploy Web Interface to Vercel

```bash
cd web
vercel
```

This deploys your web interface to Vercel.

### Step 2: Deploy Windows VM to Azure

```bash
cd terraform
terraform init
terraform apply
```

This creates a Windows VM on Azure.

### Step 3: Set Up RDP Gateway on VM

After the VM is deployed, the setup scripts will automatically:
1. Install Node.js
2. Install RDP WebSocket Gateway
3. Configure Windows Firewall
4. Start the gateway service

The gateway runs on **port 8080** and bridges WebSocket connections to RDP.

### Step 4: Access Windows in Browser

1. Open your Vercel deployment URL
2. Click "Connect" on a VM
3. Enter VM IP, username, and password
4. Click "Web RDP Client"
5. **Windows desktop opens in your browser!**

## Features

✅ **Full Windows Desktop** - Complete Windows 10/11 experience
✅ **Mouse & Keyboard** - Full input support
✅ **Clipboard Sharing** - Copy/paste between browser and Windows
✅ **Audio Redirection** - Windows audio in browser (optional)
✅ **Printer Redirection** - Print from Windows (optional)
✅ **Responsive** - Works on desktop, tablet, and mobile
✅ **Fullscreen Mode** - Press F11 for fullscreen

## Technical Details

### RDP Gateway

The RDP Gateway is a Node.js service that:
- Listens on WebSocket port 8080
- Connects to Windows RDP on port 3389
- Converts WebSocket messages to RDP protocol
- Streams Windows desktop frames to browser
- Handles mouse, keyboard, and clipboard events

### Browser RDP Client

The browser client (`rdp-viewer.html`):
- Connects via WebSocket to the gateway
- Renders Windows desktop frames on HTML5 Canvas
- Captures mouse and keyboard events
- Sends input events to Windows
- Handles clipboard synchronization

## Security Considerations

⚠️ **Important Security Notes:**

1. **RDP Gateway Port (8080)** - Should be restricted to your IP or use VPN
2. **RDP Port (3389)** - Should only be accessible through the gateway
3. **HTTPS/WSS** - For production, use HTTPS on Vercel and WSS for WebSocket
4. **Authentication** - Always use strong passwords
5. **Firewall Rules** - Restrict access to known IPs

### Recommended Security Setup

1. **Use Azure VPN** or **Bastion Host** for secure access
2. **Restrict NSG rules** to your IP address only
3. **Enable Azure AD authentication** for Windows
4. **Use SSL/TLS** for WebSocket connections (WSS)
5. **Regular updates** - Keep Windows and gateway updated

## Troubleshooting

### "Connection Failed" Error

**Problem:** Can't connect to Windows desktop

**Solutions:**
1. Check if RDP Gateway is running on VM:
   ```powershell
   Get-ScheduledTask -TaskName "RDPWebSocketGateway"
   Start-ScheduledTask -TaskName "RDPWebSocketGateway"
   ```

2. Verify firewall allows port 8080:
   ```powershell
   Get-NetFirewallRule -DisplayName "RDP WebSocket Gateway"
   ```

3. Check gateway logs:
   ```powershell
   # Gateway runs in scheduled task, check Event Viewer
   ```

### "WebSocket Connection Refused"

**Problem:** Browser can't connect to gateway

**Solutions:**
1. Verify VM public IP is correct
2. Check Azure NSG allows port 8080
3. Ensure gateway service is running
4. Try connecting from VM itself: `ws://localhost:8080/rdp`

### Windows Desktop Not Displaying

**Problem:** Connection works but no desktop shown

**Solutions:**
1. Check browser console for errors
2. Verify WebSocket messages are being received
3. Check gateway is receiving RDP frames
4. Try different resolution settings

## Performance Optimization

### For Better Performance:

1. **Use closer Azure region** - Reduces latency
2. **Increase VM size** - More CPU/RAM = better performance
3. **Adjust color depth** - Lower color depth = less bandwidth
4. **Use wired connection** - WiFi adds latency
5. **Close other browser tabs** - Frees up resources

### Recommended VM Sizes:

- **Development/Testing**: Standard_D2s_v3 (2 vCPU, 8GB RAM)
- **Production Use**: Standard_D4s_v3 (4 vCPU, 16GB RAM)
- **Heavy Workloads**: Standard_D8s_v3 (8 vCPU, 32GB RAM)

## Limitations

⚠️ **Current Limitations:**

1. **Browser Security** - Some features may be restricted by browser
2. **Network Latency** - Performance depends on your connection to Azure
3. **Bandwidth** - High-resolution desktops use more bandwidth
4. **WebSocket Support** - Requires modern browser with WebSocket support
5. **Direct RDP Better** - Native RDP client provides better performance

## Alternative: Use Apache Guacamole

For a more robust solution, consider using [Apache Guacamole](https://guacamole.apache.org/):

1. Install Guacamole on Azure VM
2. Configure Guacamole for RDP
3. Access via Vercel-hosted web interface
4. Better performance and more features

## Cost Estimation

- **Vercel**: Free (Hobby plan) or $20/month (Pro)
- **Azure VM**: ~$70-150/month depending on size
- **Bandwidth**: ~$0.05/GB outbound
- **Total**: ~$80-200/month

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Deploy Windows VM
3. ✅ Set up RDP Gateway
4. ✅ Test connection
5. ✅ Configure security
6. ✅ Enjoy Windows in your browser!

## Support

For issues:
- Check gateway logs on VM
- Review browser console for errors
- Verify network connectivity
- Check Azure VM status

---

**Note:** This solution provides a real Windows desktop experience in your browser. The Windows OS runs on Azure, and you interact with it through a WebSocket-based RDP client hosted on Vercel.

