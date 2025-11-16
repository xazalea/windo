# Windows Logo Setup

This project uses Windows logos for the loading screen and UI elements.

## Required Image Files

Place the following image files in the `web/` directory:

1. **`windows-logo-bg.png`** - The larger Windows logo image (used as background for loading screen)
   - This should be the full-screen background image with the Windows logo
   - Recommended size: 1920x1080 or larger
   - Format: PNG with transparency preferred

2. **`windows-logo.png`** - The smaller Windows logo (used for favicon, loading spinner, and UI elements)
   - This should be the Windows logo icon
   - Recommended size: 512x512 or 256x256
   - Format: PNG with transparency

## Where Logos Are Used

- **Loading Screen Background**: `windows-logo-bg.png` (full background)
- **Loading Screen Logo**: `windows-logo.png` (centered above spinner)
- **Favicon**: `windows-logo.png` (browser tab icon)
- **Terms Modal**: `windows-logo.png` (header logo)
- **Image Selector**: `windows-logo.png` (Windows 10 Lite option icon)

## Notes

- If the image files are not found, the loading screen will fall back to a dark gradient background
- The logos should have transparent backgrounds for best appearance
- The background image will be automatically scaled to cover the entire loading screen

