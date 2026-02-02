# Requirements Document

## Introduction

The Shelly IoT Color Picker is a live conference demonstration application designed for JFokus 2026. The system captures the dominant color from a webcam feed in real-time and transmits it to a Shelly IoT smart bulb, creating a visual demonstration of color extraction and IoT integration. The application prioritizes reliability and visual feedback to ensure a successful live demonstration in front of an audience.

## Glossary

- **System**: The complete Shelly IoT Color Picker application
- **Webcam_Module**: Component responsible for capturing video frames from the webcam
- **Color_Extractor**: Component that analyzes video frames to determine the dominant color
- **Shelly_Controller**: Component that communicates with the Shelly IoT bulb via HTTP API
- **UI_Display**: Visual interface showing current color, status, and controls
- **Dominant_Color**: The most prevalent color in the current webcam frame, represented as RGB values
- **Shelly_Bulb**: Physical Shelly IoT smart bulb controlled via HTTP API
- **Connection_Status**: State indicating whether webcam and bulb are available and functioning
- **Fallback_Mode**: Manual color picker mode used when webcam is unavailable

## Requirements

### Requirement 1: Webcam Color Capture

**User Story:** As a presenter, I want the system to capture video from my webcam in real-time, so that the audience can see the color extraction process happening live.

#### Acceptance Criteria

1. WHEN the application starts, THE Webcam_Module SHALL attempt to access the default webcam device
2. WHEN the webcam is successfully accessed, THE Webcam_Module SHALL capture frames at a minimum rate of 10 frames per second
3. IF the webcam is unavailable or access is denied, THEN THE System SHALL switch to Fallback_Mode and display a clear error message
4. WHILE the webcam is active, THE UI_Display SHALL show the live video feed to the audience
5. WHEN a frame is captured, THE Webcam_Module SHALL pass it to the Color_Extractor within 50 milliseconds

### Requirement 2: Dominant Color Extraction

**User Story:** As a presenter, I want the system to extract the dominant color from the webcam feed, so that the audience can see how color analysis works in real-time.

#### Acceptance Criteria

1. WHEN a video frame is received, THE Color_Extractor SHALL analyze it and determine the Dominant_Color within 100 milliseconds
2. THE Color_Extractor SHALL return the Dominant_Color as RGB values in the range 0-255
3. WHEN the Dominant_Color changes by more than 10% in any RGB channel, THE System SHALL update the displayed color
4. THE Color_Extractor SHALL ignore pixels that are pure black (0,0,0) or pure white (255,255,255) to avoid background interference
5. WHEN processing frames, THE Color_Extractor SHALL maintain CPU usage below 30% to ensure smooth operation

### Requirement 3: Shelly IoT Bulb Integration

**User Story:** As a presenter, I want the system to control a Shelly IoT bulb, so that the audience can see the extracted color reflected in physical hardware.

#### Acceptance Criteria

1. WHEN the application starts, THE Shelly_Controller SHALL attempt to connect to the configured Shelly_Bulb via HTTP API
2. WHEN a new Dominant_Color is determined, THE Shelly_Controller SHALL send the RGB values to the Shelly_Bulb within 200 milliseconds
3. IF the Shelly_Bulb is unreachable, THEN THE System SHALL display a connection error and continue operating without crashing
4. WHEN the Shelly_Bulb connection is lost, THE Shelly_Controller SHALL attempt to reconnect every 5 seconds
5. THE Shelly_Controller SHALL use the Shelly HTTP API endpoint format: `http://<bulb-ip>/color/0?turn=on&red=<r>&green=<g>&blue=<b>`
6. WHEN sending color commands, THE Shelly_Controller SHALL include a timeout of 2 seconds to prevent blocking

### Requirement 4: Visual Feedback and UI

**User Story:** As an audience member, I want to see clear visual feedback of what the system is doing, so that I can understand the demonstration without explanation.

#### Acceptance Criteria

1. THE UI_Display SHALL show the current Dominant_Color as a large, prominent color swatch visible from the back of the room
2. THE UI_Display SHALL show the RGB values of the current Dominant_Color in large, readable text
3. THE UI_Display SHALL display Connection_Status indicators for both webcam and Shelly_Bulb with clear visual states (connected/disconnected)
4. WHILE the webcam is active, THE UI_Display SHALL show the live video feed with a minimum resolution of 640x480 pixels
5. WHEN the color changes, THE UI_Display SHALL update within 100 milliseconds to maintain perceived real-time responsiveness
6. THE UI_Display SHALL use a clean, modern design without generic or template-like aesthetics

### Requirement 5: Manual Fallback Mode

**User Story:** As a presenter, I want a manual color picker as a fallback, so that I can continue the demonstration even if the webcam fails.

#### Acceptance Criteria

1. WHERE the webcam is unavailable, THE System SHALL provide a manual color picker interface
2. WHEN the user selects a color manually, THE System SHALL send it to the Shelly_Bulb using the same mechanism as automatic mode
3. THE UI_Display SHALL clearly indicate when the system is operating in Fallback_Mode
4. WHEN in Fallback_Mode, THE System SHALL allow the user to attempt to reconnect to the webcam
5. THE manual color picker SHALL support full RGB color selection with visual preview

### Requirement 6: Error Handling and Graceful Degradation

**User Story:** As a presenter, I want the system to handle errors gracefully, so that a hardware failure doesn't crash the demo in front of the audience.

#### Acceptance Criteria

1. IF the webcam disconnects during operation, THEN THE System SHALL switch to Fallback_Mode without crashing
2. IF the Shelly_Bulb becomes unreachable, THEN THE System SHALL continue operating and display the connection error
3. WHEN an error occurs, THE UI_Display SHALL show a clear, non-technical error message suitable for audience viewing
4. THE System SHALL log all errors to the console for post-demo debugging without displaying technical details to the audience
5. WHEN network requests to the Shelly_Bulb fail, THE System SHALL not block the UI or color extraction process

### Requirement 7: Performance and Reliability

**User Story:** As a presenter, I want the system to perform reliably under demo conditions, so that I can focus on presenting rather than troubleshooting.

#### Acceptance Criteria

1. THE System SHALL maintain end-to-end latency from color capture to bulb update below 500 milliseconds under normal conditions
2. THE System SHALL operate continuously for at least 30 minutes without memory leaks or performance degradation
3. WHEN the system starts, THE System SHALL complete initialization and be ready for demonstration within 5 seconds
4. THE System SHALL handle rapid color changes (more than 5 per second) without dropping frames or becoming unresponsive
5. THE UI_Display SHALL maintain a frame rate of at least 30 FPS to ensure smooth visual feedback

### Requirement 8: Configuration and Setup

**User Story:** As a presenter, I want easy configuration of the Shelly bulb connection, so that I can quickly set up the demo in different venues.

#### Acceptance Criteria

1. THE System SHALL allow configuration of the Shelly_Bulb IP address through a settings interface or configuration file
2. WHEN the Shelly_Bulb IP address is changed, THE System SHALL validate the format before attempting connection
3. THE System SHALL provide a connection test button to verify Shelly_Bulb connectivity before starting the demo
4. WHERE multiple webcams are available, THE System SHALL allow selection of the desired webcam device
5. THE System SHALL persist configuration settings between application restarts
