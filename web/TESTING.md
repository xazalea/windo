# Testing Guide - Azalea Windows Emulator

This guide helps you verify that Azalea works correctly and Windows can run apps and browsers.

## Pre-Deployment Testing

### 1. Local Testing

```bash
cd web
# Use a local server (required for CORS)
python -m http.server 8000
# or
npx serve .
```

Then open: `http://localhost:8000/terms.html`

### 2. Test Terms Page

1. ✅ Terms page loads
2. ✅ Scroll indicator appears
3. ✅ Accept button is disabled initially
4. ✅ Scrolling enables accept button
5. ✅ Clicking accept redirects to emulator

### 3. Test Emulator Loading

1. ✅ v86.js loads from CDN
2. ✅ Windows image URL is correct
3. ✅ Loading overlay appears
4. ✅ Progress bar updates
5. ✅ Status messages update

### 4. Test Windows Boot

1. ✅ BIOS loads (2-5 seconds)
2. ✅ CD-ROM detected
3. ✅ Windows boot process starts
4. ✅ Boot messages appear
5. ✅ Windows desktop appears (30-60 seconds)

## Functional Testing

### Test Mouse Input

1. ✅ Mouse moves on canvas
2. ✅ Click works (left button)
3. ✅ Right-click works
4. ✅ Mouse wheel scrolls
5. ✅ Cursor follows mouse

### Test Keyboard Input

1. ✅ Typing works in Windows
2. ✅ Special keys work (Enter, Escape, etc.)
3. ✅ Arrow keys work
4. ✅ Function keys work
5. ✅ Keyboard shortcuts work (Ctrl+C, Ctrl+V)

### Test Windows Apps

1. ✅ **Notepad**: Open and type
2. ✅ **Calculator**: Perform calculations
3. ✅ **File Explorer**: Browse files
4. ✅ **Command Prompt**: Run commands
5. ✅ **Paint**: Draw and save

### Test Browser in Windows

1. ✅ Open Internet Explorer/Edge in Windows
2. ✅ Navigate to websites (if network enabled)
3. ✅ Browser renders pages
4. ✅ Links work
5. ✅ Forms can be filled

### Test App Installation

1. ✅ Download installer (if network enabled)
2. ✅ Run .exe files
3. ✅ Install applications
4. ✅ Launch installed apps
5. ✅ Apps function correctly

## Performance Testing

### Expected Performance

- **Boot Time**: 30-60 seconds
- **FPS**: 30-60fps (on modern hardware)
- **App Launch**: 5-15 seconds
- **Responsiveness**: Good for basic apps

### Performance Checklist

1. ✅ FPS stays above 30fps
2. ✅ No memory leaks
3. ✅ Smooth mouse movement
4. ✅ Responsive keyboard
5. ✅ Apps launch successfully

## Browser Compatibility

### Tested Browsers

- ✅ Chrome/Edge (latest) - Best performance
- ✅ Firefox (latest) - Good performance
- ✅ Safari (latest) - Good performance
- ⚠️ Older browsers may have issues

## Common Issues & Solutions

### Issue: Windows Won't Boot

**Check**:
1. Image URL is accessible
2. CORS headers allow browser access
3. Internet connection is stable
4. Browser console for errors

**Solution**: Wait longer (up to 2 minutes), check console

### Issue: Mouse/Keyboard Not Working

**Check**:
1. Canvas has focus (click on it)
2. Browser console for errors
3. v86.js loaded correctly

**Solution**: Click canvas to focus, refresh page

### Issue: Apps Won't Open

**Check**:
1. Windows has fully booted
2. Enough memory allocated
3. App is compatible with Windows 10 Lite

**Solution**: Wait for full boot, increase memory, try different app

### Issue: Browser in Windows Won't Load Pages

**Check**:
1. Network is enabled in settings
2. WebSocket relay is working
3. Internet connection in Windows

**Solution**: Enable network, check relay status

## Automated Testing

### Console Commands

```javascript
// Check if emulator is running
console.log(emulator.emulator ? 'Running' : 'Not running');

// Check performance
console.log(emulator.performanceOptimizer.getMetrics());

// Check FPS
console.log('FPS:', emulator.fps);
```

## Verification Checklist

Before deploying, verify:

- [ ] Terms page works
- [ ] Emulator loads
- [ ] Windows boots
- [ ] Mouse works
- [ ] Keyboard works
- [ ] Apps open
- [ ] Browser works (if network enabled)
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Works on multiple browsers

## Deployment Testing

After deploying to Vercel:

1. ✅ Site loads
2. ✅ Terms page works
3. ✅ Emulator loads
4. ✅ Windows boots
5. ✅ All features work
6. ✅ Performance is good

## Reporting Issues

When reporting issues, include:

1. Browser and version
2. Operating system
3. Console errors
4. Steps to reproduce
5. Expected vs actual behavior
6. Performance metrics (FPS, memory)

## Success Criteria

✅ **Windows boots successfully**
✅ **Apps can be opened**
✅ **Browser works in Windows**
✅ **Mouse and keyboard work**
✅ **Performance is acceptable (30+ FPS)**
✅ **No critical errors**

---

**Azalea is working correctly when you can:**
- Boot Windows 10 Lite
- Open Notepad and type
- Open Calculator and calculate
- Open File Explorer and browse
- Open a browser in Windows and navigate
- Install and run applications

