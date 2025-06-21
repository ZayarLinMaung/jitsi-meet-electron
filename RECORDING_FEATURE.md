# Recording Feature Documentation

## Overview

The Medcom Vision Jitsi Meet Electron app now includes a comprehensive recording feature with multiple recording options, including browser-based screen recording as a reliable fallback when server-based recording is not available.

## Features

### Recording Controls
- **Fixed Position Controls**: Recording controls appear in the top-right corner of the meeting interface
- **Visual Recording Indicator**: Animated red dot shows when recording is active
- **Duration Timer**: Shows real-time recording duration in MM:SS format
- **Mode Selection**: Choose between different recording modes before starting
- **Automatic Download**: Screen recordings are automatically downloaded when completed

### Recording Modes

1. **Screen Recording** (Default & Recommended)
   - Uses browser's native screen capture API
   - Records your entire screen including the meeting
   - Files are automatically downloaded to your default download folder
   - Works reliably without server configuration
   - Supports both video and audio recording
   - Format: WebM video file with timestamp in filename

2. **Server Recording**
   - Records to the Jitsi server (requires server configuration)
   - Files are processed server-side and made available for download
   - Requires Jibri (Jitsi Broadcasting Infrastructure) setup
   - May need moderator permissions

3. **Live Stream**
   - Streams the meeting to an external platform
   - Requires additional configuration for streaming services
   - Supports platforms like YouTube Live, Facebook Live, etc.

## How to Use

### Starting a Recording

1. **Join a Meeting**: First, join or start a meeting using the QR scanner
2. **Select Recording Mode**: In the recording controls (top-right), choose your preferred recording mode:
   - **Screen Recording**: Recommended for most users (works without server setup)
   - **Server Recording**: If your server supports it
   - **Live Stream**: For broadcasting to external platforms
3. **Start Recording**: Click the red "🔴 Record" button
4. **Grant Permissions**: For screen recording, you'll be asked to:
   - Select which screen/window to record
   - Allow audio recording (optional but recommended)
5. **Confirm**: The recording will start and you'll see:
   - Red recording indicator with pulsing animation
   - Real-time duration timer
   - "Recording: XX:XX" status message

### Stopping a Recording

1. **Stop Button**: Click the "⏹️ Stop" button in the recording controls
2. **Automatic Processing**: 
   - **Screen Recording**: File is automatically downloaded to your Downloads folder
   - **Server Recording**: File is processed server-side (download link may be provided)
   - **Live Stream**: Stream ends immediately

### Screen Recording File Details

- **File Format**: WebM (widely supported, good compression)
- **Filename**: `medcom-meeting-YYYY-MM-DDTHH-MM-SS.webm`
- **Video Quality**: Up to 1920x1080 (Full HD) at 30 FPS
- **Audio**: Included with noise suppression and echo cancellation
- **File Location**: Your browser's default download directory

## Technical Details

### Browser Compatibility

#### Screen Recording Support
- **Chrome/Chromium**: Full support ✅
- **Firefox**: Full support ✅  
- **Safari**: Limited support (macOS Monterey+) ⚠️
- **Edge**: Full support ✅

#### Server Recording Support
- **All Browsers**: Depends on server configuration

### API Integration
- Uses Jitsi Meet External API's `startRecording` and `stopRecording` commands for server recording
- Uses browser's `getDisplayMedia` API for screen recording
- Listens for `recordingStatusChanged` events to update UI
- MediaRecorder API for local video processing

### User Interface
- **Recording Controls Component**: `app/features/conference/components/RecordingControls.js`
- **Navbar Button**: `app/features/navbar/components/RecordingButton.js` (for future integration)
- **Styled Components**: Modern UI with animations and hover effects
- **Responsive Design**: Adapts to different screen sizes

### Error Handling
- Automatic fallback suggestions (e.g., suggests Screen Recording when server recording fails)
- Clear error messages for permission issues
- Loading states during start/stop operations
- Graceful cleanup of resources

## Configuration Requirements

### For Screen Recording (Default)
- **No server configuration required** ✅
- Works with any Jitsi Meet instance
- Only requires browser permissions
- Files stored locally on user's device

### For Server Recording
- Requires Jibri (Jitsi Broadcasting Infrastructure) setup
- Server must be configured for file recording
- May require authentication/permissions
- Moderator rights may be needed

### For Live Streaming
- Requires streaming service configuration
- May need RTMP keys or platform-specific setup
- Additional server configuration required
- External service account needed

## Troubleshooting

### Screen Recording Issues

#### Recording Not Starting
1. **Permission Denied**: Make sure to:
   - Click "Allow" when browser asks for screen recording permission
   - Select the correct screen/window to record
   - Enable audio sharing if you want audio included

2. **Browser Not Supported**: 
   - Try using Chrome or Firefox for best compatibility
   - Update your browser to the latest version

#### No Audio in Recording
1. Make sure to check "Share audio" when selecting screen to record
2. Verify your system audio is working
3. Some browsers may not support audio recording with screen capture

#### File Not Downloaded
1. Check your browser's download settings
2. Look in your default Downloads folder
3. Check if downloads were blocked by browser security settings

### Server Recording Issues

#### "Local recording is either disabled or not supported"
- **Solution**: This error means the Jitsi server doesn't support local recording
- **Workaround**: Use Screen Recording mode instead (it's more reliable anyway)

#### Permission Issues
1. Verify you have moderator rights in the meeting
2. Check if server-side recording is configured properly
3. Contact your Jitsi server administrator

### General Issues

#### Recording Controls Not Visible
1. Make sure you're in a meeting (not on the welcome screen)
2. Check if the controls are hidden behind other UI elements
3. Try refreshing the meeting

#### Poor Recording Quality
1. **Screen Recording**: Ensure good internet connection for smooth capture
2. Close unnecessary applications to free system resources
3. Record with lower resolution if performance is poor

## Privacy Considerations

- **Screen Recording**: Only you have access to the recorded file
- **Server Recording**: Files may be stored on the server (check with administrator)
- **Always inform participants** when recording starts
- **Respect local privacy laws** and regulations
- **Be aware of data storage implications** for different recording modes

## Best Practices

### For Screen Recording
1. **Close unnecessary applications** before recording to reduce clutter
2. **Use fullscreen mode** for cleaner recordings
3. **Test audio levels** before important meetings
4. **Ensure stable internet** for smooth video capture
5. **Have sufficient disk space** for video files

### File Management
1. **Organize recordings** by date or meeting topic
2. **Backup important recordings** to cloud storage
3. **Delete old recordings** to free up disk space
4. **Consider file size** - meetings can generate large files

### Meeting Etiquette
1. **Announce when recording starts** to all participants
2. **Get consent** from participants when required
3. **Stop recording** during breaks or private discussions
4. **Share recordings responsibly** and only with authorized people

## Future Enhancements

- Custom recording quality settings
- Multiple audio sources (microphone + system audio)
- Recording pause/resume functionality
- Integration with cloud storage services
- Automatic meeting transcription
- Recording scheduling and automation
- Video editing capabilities within the app 