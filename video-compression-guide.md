# Video Compression Guide for Webflow

## The 9.9MB video needs compression. Here are your options:

### Option 1: Online Compression
- Use CloudConvert.com
- Set target size to under 8MB
- Maintain video quality

### Option 2: HandBrake (Free Software)
1. Download HandBrake
2. Load your 9.9MB video
3. Use "Web Optimized" preset
4. Adjust quality slider to get under 8MB

### Option 3: Use External Hosting
- Upload to Vimeo (private/unlisted)
- Use Vimeo's embed URL in Webflow
- Better for larger files

## Quick Settings for Compression:
- Resolution: Keep original (probably 1920x1080)
- Bitrate: Reduce to ~1000 kbps
- Format: MP4 H.264
- Target: Under 8MB file size