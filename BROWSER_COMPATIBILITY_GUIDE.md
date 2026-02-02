# Browser Compatibility Testing Guide

## Overview

This guide provides instructions for testing the Shelly IoT Color Picker application across different browsers and screen sizes. The application uses modern browser APIs that require specific browser versions and HTTPS for production use.

## Browser Requirements

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome | 53+ | Full support for all features |
| Firefox | 36+ | Full support for all features |
| Safari | 11+ | Full support for all features |
| Edge | 79+ (Chromium) | Full support for all features |

## Required Browser APIs

The application uses the following browser APIs:

### 1. MediaStream API (getUserMedia)
- **Used by**: WebcamService for webcam access
- **Chrome**: 53+
- **Firefox**: 36+
- **Safari**: 11+
- **HTTPS Required**: Yes (except localhost for development)

### 2. Canvas API
- **Used by**: ColorExtractor for frame capture and pixel analysis
- **Support**: All modern browsers (universal support)
- **Features used**: `getContext('2d')`, `drawImage()`, `getImageData()`

### 3. Fetch API with AbortController
- **Used by**: ShellyController for HTTP requests with timeout
- **Chrome**: 66+ (AbortController)
- **Firefox**: 57+ (AbortController)
- **Safari**: 12.1+ (AbortController)

### 4. localStorage
- **Used by**: ConfigManager for configuration persistence
- **Support**: All modern browsers (universal support)

### 5. requestAnimationFrame
- **Used by**: WebcamService for frame capture timing
- **Support**: All modern browsers (universal support)

## HTTPS Requirement

### Production Environment
- **Webcam access requires HTTPS** in production
- The MediaStream API (`getUserMedia`) is only available in secure contexts
- Deploy to HTTPS-enabled hosting (Netlify, Vercel, GitHub Pages)

### Development Environment
- **localhost is exempt** from HTTPS requirement
- `npm run dev` works on `http://localhost:5173`

### Error Handling
The application displays user-friendly error messages when:
- Webcam permission is denied
- Webcam device is not found
- Webcam is in use by another application

## Testing Checklist

### Chrome Testing

1. **Open Chrome** (version 53+)
2. **Navigate to the application URL**
3. **Test webcam access**:
   - [ ] Click "Allow" when prompted for camera permission
   - [ ] Verify video feed displays correctly
   - [ ] Verify color extraction works
4. **Test manual mode**:
   - [ ] Deny camera permission or disconnect webcam
   - [ ] Verify app switches to manual mode
   - [ ] Verify manual color picker works
5. **Test responsive design**:
   - [ ] Open DevTools (F12)
   - [ ] Toggle device toolbar (Ctrl+Shift+M)
   - [ ] Test at 320px width (mobile)
   - [ ] Test at 768px width (tablet)
   - [ ] Test at 1920px width (large display)

### Firefox Testing

1. **Open Firefox** (version 36+)
2. **Navigate to the application URL**
3. **Test webcam access**:
   - [ ] Click "Allow" when prompted for camera permission
   - [ ] Verify video feed displays correctly
   - [ ] Verify color extraction works
4. **Test manual mode**:
   - [ ] Deny camera permission or disconnect webcam
   - [ ] Verify app switches to manual mode
   - [ ] Verify manual color picker works
5. **Test responsive design**:
   - [ ] Open DevTools (F12)
   - [ ] Toggle Responsive Design Mode (Ctrl+Shift+M)
   - [ ] Test at various screen sizes

### Safari Testing

1. **Open Safari** (version 11+)
2. **Navigate to the application URL**
3. **Test webcam access**:
   - [ ] Click "Allow" when prompted for camera permission
   - [ ] Verify video feed displays correctly
   - [ ] Verify color extraction works
4. **Test manual mode**:
   - [ ] Deny camera permission or disconnect webcam
   - [ ] Verify app switches to manual mode
   - [ ] Verify manual color picker works
5. **Test responsive design**:
   - [ ] Enable Develop menu (Safari > Preferences > Advanced)
   - [ ] Use Develop > Enter Responsive Design Mode
   - [ ] Test at various screen sizes

## Responsive Design Breakpoints

The application has responsive styles for three screen size categories:

### Mobile (max-width: 768px)
- Header stacks vertically
- Smaller font sizes
- Video feed minimum width reduced to 100%
- Compact status indicators
- Settings panel full-width

### Desktop (default)
- Standard layout
- Video feed minimum 640x480
- Full-size status indicators

### Large Display (min-width: 1920px)
- Larger fonts for conference room visibility
- Larger color swatch (250x250px)
- Larger status indicators
- Enhanced padding

## CSS Features Used

### Standard CSS (No Vendor Prefixes Needed)
- Flexbox (`display: flex`)
- CSS Grid (not used)
- Border-radius
- Box-shadow
- CSS Transitions
- CSS Animations (`@keyframes`)
- Media queries

### Vendor-Prefixed CSS (Already Included)
- `-webkit-appearance: none` (for slider styling)
- `-webkit-font-smoothing` (for text rendering)
- `-moz-osx-font-smoothing` (for text rendering)
- `backdrop-filter` (for blur effects - may not work in older browsers)

## Known Browser-Specific Behaviors

### Safari
- `backdrop-filter` requires `-webkit-backdrop-filter` prefix (already handled by Vite)
- Video `autoplay` requires `muted` attribute (already set)
- `playsInline` attribute required for inline video playback (already set)

### Firefox
- Range input (slider) styling uses `::-moz-range-thumb` (already included)
- Some CSS properties may render slightly differently

### Chrome
- Range input (slider) styling uses `::-webkit-slider-thumb` (already included)
- Best support for all features

## Testing HTTPS Requirement Messaging

### Test Scenario: Non-HTTPS Access
1. Deploy to HTTP-only server (or use browser flags to simulate)
2. Attempt to access webcam
3. **Expected**: Browser blocks `getUserMedia` call
4. **Expected**: Application shows "permission-denied" error
5. **Expected**: Application switches to manual mode

### Test Scenario: Permission Denied
1. Access application via HTTPS or localhost
2. When prompted for camera permission, click "Block" or "Deny"
3. **Expected**: Application shows user-friendly error message
4. **Expected**: Application switches to manual mode
5. **Expected**: "Reconnect Webcam" button is available

## Performance Testing by Browser

### Frame Rate Test
1. Open browser DevTools
2. Go to Performance tab
3. Start recording
4. Observe webcam feed for 10 seconds
5. Stop recording
6. **Expected**: Consistent 10+ FPS frame capture

### Memory Test
1. Open browser DevTools
2. Go to Memory tab (Chrome) or Performance tab (Firefox)
3. Take heap snapshot
4. Run application for 5 minutes
5. Take another heap snapshot
6. **Expected**: No significant memory growth (no memory leaks)

## Troubleshooting

### Webcam Not Working
1. Check browser permissions (camera icon in address bar)
2. Ensure HTTPS or localhost
3. Check if another application is using the webcam
4. Try refreshing the page

### Styles Look Wrong
1. Clear browser cache
2. Check browser version meets minimum requirements
3. Check for CSS errors in DevTools console

### Shelly Bulb Not Connecting
1. Verify bulb IP address is correct
2. Ensure bulb is on same network
3. Check for CORS errors in console (Gen1 bulbs typically allow CORS)
4. Verify bulb is powered on and connected to WiFi

## Summary

The Shelly IoT Color Picker application is designed to work across all modern browsers with the following key considerations:

1. **HTTPS is required** for webcam access in production
2. **Responsive design** supports mobile, desktop, and large conference displays
3. **Graceful degradation** to manual mode when webcam is unavailable
4. **No additional vendor prefixes needed** - Vite handles autoprefixing
5. **All critical APIs** are well-supported in target browsers

For the best demo experience, use **Chrome** on a **large display** with **HTTPS** enabled.
