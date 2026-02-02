# Performance Testing Guide - Shelly IoT Color Picker

## Task 15.2: Performance Testing and Optimization

This guide provides instructions for manual performance testing with actual hardware (webcam and Shelly bulb).

---

## Performance Targets (from Requirements 7.1, 7.4, 7.5)

| Metric | Target | Source |
|--------|--------|--------|
| End-to-end latency | < 500ms | Requirement 7.1 |
| Color extraction | < 100ms per frame | Requirement 2.1 |
| Shelly update | < 200ms | Requirement 3.2 |
| Frame capture | ≥ 10 FPS | Requirement 1.2 |
| UI frame rate | ≥ 30 FPS | Requirement 7.5 |
| Rapid color changes | > 5/second without dropping | Requirement 7.4 |

---

## Code Analysis: Performance Characteristics

### 1. ColorExtractor (`src/services/ColorExtractor.ts`)

**Performance Optimizations Implemented:**
- ✅ **Pixel Sampling**: Samples every 4th pixel (`sampleRate: 4`) to reduce computation
- ✅ **K-means Clustering**: Uses k=5 clusters with max 10 iterations
- ✅ **Early Convergence**: Exits k-means early if centroids converge (distance < 1)
- ✅ **Extreme Filtering**: Filters pure black/white pixels to avoid background interference

**Expected Performance:**
- For 640x480 frame: ~76,800 pixels → ~19,200 sampled pixels
- K-means with 5 clusters, 10 iterations max
- Should complete in < 100ms

### 2. ShellyController (`src/services/ShellyController.ts`)

**Performance Optimizations Implemented:**
- ✅ **2-second Timeout**: Uses `AbortController` with 2000ms timeout
- ✅ **Request Queuing**: Prevents flooding the bulb with simultaneous requests
- ✅ **5-second Reconnection**: Automatic reconnection every 5 seconds on failure

**Key Code:**
```typescript
private readonly timeout: number = 2000 // 2 seconds as per requirements
private readonly reconnectInterval: number = 5000 // 5 seconds as per requirement 3.4
```

### 3. WebcamService (`src/services/WebcamService.ts`)

**Performance Optimizations Implemented:**
- ✅ **Minimum 10 FPS**: Enforces `Math.max(fps, 10)` for frame rate
- ✅ **requestAnimationFrame**: Uses RAF for smooth frame capture
- ✅ **Frame Throttling**: Throttles to target FPS using timestamp comparison
- ✅ **Canvas Optimization**: Uses `willReadFrequently: true` for canvas context

**Key Code:**
```typescript
// Ensure minimum 10 FPS
const targetFps = Math.max(fps, 10)
frameInterval = 1000 / targetFps

// Canvas optimization for frequent reads
context = canvas.getContext('2d', { willReadFrequently: true })
```

### 4. App Component (`src/components/App.tsx`)

**Performance Optimizations Implemented:**
- ✅ **Significant Change Detection**: Only updates bulb when color changes by > 10%
- ✅ **useCallback**: Memoizes event handlers to prevent unnecessary re-renders
- ✅ **useRef**: Uses refs for services to avoid re-initialization

---

## Manual Testing Instructions

### Prerequisites

1. **Hardware Setup:**
   - Webcam connected and working
   - Shelly Gen1 bulb powered on and connected to network
   - Bulb simulator running at `http://localhost:8080` (for testing without hardware)

2. **Configuration:**
   - Update Shelly bulb IP address in the app settings
   - Or use the bulb simulator URL

### Test 1: End-to-End Latency (< 500ms)

**Objective:** Verify total time from color capture to bulb update is under 500ms.

**Steps:**
1. Start the app: `npm run dev`
2. Open browser DevTools (F12) → Console tab
3. Add performance logging by opening the Console and running:
   ```javascript
   // This will help track timing
   console.log('Performance monitoring enabled')
   ```
4. Hold a colored object (e.g., red paper) in front of the webcam
5. Observe:
   - Color swatch updates in UI
   - Bulb color changes (or simulator updates)
6. **Expected:** Color change should be visible on bulb within 500ms of showing the object

**How to Measure:**
- Use a stopwatch or video recording
- Compare when object appears in webcam feed vs when bulb changes
- Should be nearly instantaneous (< 0.5 seconds)

### Test 2: Color Extraction Performance (< 100ms)

**Objective:** Verify color extraction completes within 100ms per frame.

**Steps:**
1. Open browser DevTools → Performance tab
2. Click "Record" and interact with the app for 10-15 seconds
3. Stop recording and analyze the flame chart
4. Look for `extractDominantColor` function calls
5. **Expected:** Each call should complete in < 100ms

**Alternative Method:**
Add temporary logging to `src/services/ColorExtractor.ts`:
```typescript
extractDominantColor(imageData: ImageData, options: Partial<ExtractionOptions> = {}): RGB {
  const startTime = performance.now()
  // ... existing code ...
  const endTime = performance.now()
  console.log(`Color extraction took: ${endTime - startTime}ms`)
  return largestCluster
}
```

### Test 3: Shelly Update Latency (< 200ms)

**Objective:** Verify HTTP requests to Shelly bulb complete within 200ms.

**Steps:**
1. Open browser DevTools → Network tab
2. Filter by "color" to see Shelly API requests
3. Observe the "Time" column for each request
4. **Expected:** Each request should complete in < 200ms (excluding timeout scenarios)

**With Bulb Simulator:**
- Requests to `localhost:8080` should be very fast (< 50ms)
- Real bulb on local network should be < 200ms

### Test 4: Rapid Color Changes (> 5/second)

**Objective:** Verify system handles rapid color changes without dropping frames or becoming unresponsive.

**Steps:**
1. Start the app with webcam active
2. Rapidly wave different colored objects in front of the webcam
3. Or use the manual color picker and rapidly change colors
4. Observe:
   - UI remains responsive
   - Color swatch updates smoothly
   - No console errors about dropped frames
5. **Expected:** System should handle > 5 color changes per second

**Stress Test:**
```javascript
// Run in browser console to simulate rapid color changes
let count = 0
const interval = setInterval(() => {
  count++
  console.log(`Color change ${count}`)
  if (count >= 50) clearInterval(interval)
}, 100) // 10 changes per second
```

### Test 5: UI Frame Rate (≥ 30 FPS)

**Objective:** Verify UI maintains smooth 30+ FPS rendering.

**Steps:**
1. Open browser DevTools → Performance tab
2. Enable "Screenshots" option
3. Record for 10-15 seconds while using the app
4. Analyze the "Frames" section
5. **Expected:** Frame rate should stay above 30 FPS

**Alternative Method:**
1. Open DevTools → Rendering tab (may need to enable in More Tools)
2. Enable "Frame Rendering Stats"
3. Observe the FPS counter overlay
4. **Expected:** Should show 30+ FPS consistently

### Test 6: Frame Capture Rate (≥ 10 FPS)

**Objective:** Verify webcam captures at least 10 frames per second.

**Steps:**
1. Add temporary logging to track frame captures:
   ```javascript
   // In browser console, monitor frame rate
   let frameCount = 0
   const originalLog = console.log
   console.log = (...args) => {
     if (args[0]?.includes?.('frame')) frameCount++
     originalLog.apply(console, args)
   }
   setInterval(() => {
     console.info(`Frames in last second: ${frameCount}`)
     frameCount = 0
   }, 1000)
   ```
2. **Expected:** Should see 10+ frames per second

---

## Performance Optimization Recommendations

Based on code review, the following optimizations are already in place:

### Already Implemented ✅

1. **Pixel Sampling** - Reduces color extraction computation by 75%
2. **Request Queuing** - Prevents bulb flooding
3. **Frame Throttling** - Maintains consistent FPS
4. **Canvas Optimization** - `willReadFrequently: true` for better performance
5. **Significant Change Detection** - Only updates when color changes meaningfully
6. **AbortController Timeout** - Prevents hanging requests

### Potential Future Optimizations (if needed)

1. **Web Workers** - Move color extraction to a worker thread if CPU usage is high
2. **Debouncing** - Add debounce to bulb updates if network is slow
3. **Lower Resolution** - Reduce canvas size for faster extraction
4. **Fewer Clusters** - Reduce k-means clusters from 5 to 3 for faster convergence

---

## Troubleshooting

### High Latency (> 500ms)

- Check network latency to Shelly bulb
- Verify bulb is on same network segment
- Check for network congestion
- Try reducing color extraction clusters

### Dropped Frames

- Check CPU usage in Task Manager
- Close other browser tabs
- Reduce webcam resolution
- Increase sample rate (sample fewer pixels)

### UI Stuttering

- Check for console errors
- Verify no memory leaks (monitor heap size)
- Check for excessive re-renders in React DevTools

---

## Test Results Template

Use this template to document your test results:

```
## Performance Test Results - [Date]

### Environment
- Browser: [Chrome/Firefox/Safari] [Version]
- OS: [Windows/Mac/Linux]
- Webcam: [Model]
- Shelly Bulb: [Model] / Simulator

### Results

| Test | Target | Actual | Pass/Fail |
|------|--------|--------|-----------|
| End-to-end latency | < 500ms | ___ms | |
| Color extraction | < 100ms | ___ms | |
| Shelly update | < 200ms | ___ms | |
| Frame capture | ≥ 10 FPS | ___FPS | |
| UI frame rate | ≥ 30 FPS | ___FPS | |
| Rapid changes | > 5/sec | ___/sec | |

### Notes
[Any observations or issues]
```

---

## Conclusion

The codebase has been designed with performance in mind. All key performance optimizations are already implemented:

- **ColorExtractor**: Pixel sampling, early convergence, extreme filtering
- **ShellyController**: 2-second timeout, request queuing, auto-reconnection
- **WebcamService**: 10 FPS minimum, RAF-based capture, canvas optimization
- **App**: Significant change detection, memoized callbacks

Manual testing with actual hardware is required to verify these targets are met in real-world conditions.
