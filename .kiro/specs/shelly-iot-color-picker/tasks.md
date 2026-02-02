# Implementation Plan: Shelly IoT Color Picker

## Overview

This implementation plan breaks down the Shelly IoT Color Picker into discrete, testable coding tasks. The approach follows TDD principles with tests written before implementation, prioritizes the critical path (webcam → color extraction → bulb control), and ensures graceful error handling throughout.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Vite + React + TypeScript project
  - Install dependencies: fast-check, vitest, @testing-library/react
  - Configure Vitest with fake timers support
  - Set up CSS Modules configuration
  - Create project directory structure (services, components, utils)
  - _Requirements: 8.1_

- [ ] 2. Implement Configuration Manager
  - [x] 2.1 Create ConfigManager with localStorage persistence
    - Define AppConfig interface and default values
    - Implement getConfig, updateConfig, resetToDefaults methods
    - Implement IP address validation using regex
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [ ]* 2.2 Write property test for configuration round-trip
    - **Property 11: Configuration Persistence Round-Trip**
    - **Validates: Requirements 8.5**
  
  - [ ]* 2.3 Write property test for IP validation
    - **Property 10: IP Address Validation**
    - **Validates: Requirements 8.2**
  
  - [ ]* 2.4 Write unit tests for ConfigManager
    - Test default configuration values
    - Test invalid IP rejection
    - Test localStorage integration
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 3. Implement Color Extractor service
  - [x] 3.1 Create RGB interface and color utilities
    - Define RGB type with red, green, blue fields (0-255)
    - Implement color distance calculation (Euclidean)
    - Implement hasSignificantChange function with 10% threshold
    - _Requirements: 2.2, 2.3_
  
  - [x] 3.2 Implement k-means color extraction algorithm
    - Create extractDominantColor function with k=5 clusters
    - Implement pixel sampling (every 4th pixel)
    - Filter out pure black (0,0,0) and pure white (255,255,255)
    - Ensure extraction completes in <100ms for 640x480 frames
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [ ]* 3.3 Write property test for RGB range invariant
    - **Property 1: RGB Output Range Invariant**
    - **Validates: Requirements 2.2**
  
  - [ ]* 3.4 Write property test for color change detection
    - **Property 2: Color Change Detection Threshold**
    - **Validates: Requirements 2.3**
  
  - [ ]* 3.5 Write property test for extreme color filtering
    - **Property 3: Extreme Color Filtering**
    - **Validates: Requirements 2.4**
  
  - [ ]* 3.6 Write property test for extraction performance
    - **Property 15: Color Extraction Performance**
    - **Validates: Requirements 2.1**
  
  - [ ]* 3.7 Write unit tests for color utilities
    - Test color distance calculation with known values
    - Test edge cases (identical colors, maximum distance)
    - _Requirements: 2.2, 2.3_

- [x] 4. Checkpoint - Ensure color extraction tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Shelly Controller service
  - [x] 5.1 Create ShellyController with HTTP client
    - Define ShellyController interface and types (ShellyStatus, ShellyResult, ShellyError)
    - Implement URL generation for Shelly Gen1 API format
    - Implement setColor with Fetch API and 2-second timeout using AbortController
    - Implement testConnection and getStatus methods
    - _Requirements: 3.1, 3.2, 3.5, 3.6_
  
  - [x] 5.2 Implement error handling and reconnection logic
    - Handle network errors, timeouts, invalid responses
    - Implement exponential backoff reconnection (5s intervals)
    - Implement request queuing to prevent flooding
    - _Requirements: 3.3, 3.4, 6.2, 6.5_
  
  - [ ]* 5.3 Write property test for Shelly API URL format
    - **Property 4: Shelly API URL Format**
    - **Validates: Requirements 3.5, 3.6**
  
  - [ ]* 5.4 Write property test for bulb error resilience
    - **Property 6: Bulb Error Resilience**
    - **Validates: Requirements 3.3, 6.2, 6.5**
  
  - [ ]* 5.5 Write property test for Shelly update latency
    - **Property 16: Shelly Update Latency**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.6 Write property test for reconnection timing
    - **Property 17: Reconnection Timing**
    - **Validates: Requirements 3.4**
  
  - [ ]* 5.7 Write unit tests for ShellyController
    - Test successful color update
    - Test timeout handling
    - Test network error handling
    - Test request queuing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 6. Implement Webcam Service
  - [x] 6.1 Create WebcamService with MediaStream API
    - Define WebcamService interface and types (WebcamResult, WebcamError)
    - Implement initialize method with getUserMedia
    - Implement getAvailableDevices for device enumeration
    - Implement getVideoStream and isActive methods
    - _Requirements: 1.1, 8.4_
  
  - [x] 6.2 Implement frame capture with canvas
    - Create off-screen canvas for frame extraction
    - Implement startCapture with requestAnimationFrame and FPS throttling (10 FPS minimum)
    - Extract ImageData from video frames
    - Implement stopCapture with resource cleanup
    - Ensure frame processing latency <50ms
    - _Requirements: 1.2, 1.5_
  
  - [x] 6.3 Implement error handling for webcam failures
    - Handle permission denied, device not found, device in use errors
    - Map MediaStream errors to WebcamError types
    - _Requirements: 1.3, 6.1_
  
  - [ ]* 6.4 Write property test for webcam error handling
    - **Property 5: Webcam Error Handling**
    - **Validates: Requirements 1.3, 6.1**
  
  - [ ]* 6.5 Write property test for frame rate minimum
    - **Property 13: Frame Rate Minimum**
    - **Validates: Requirements 1.2**
  
  - [ ]* 6.6 Write property test for frame processing latency
    - **Property 14: Frame Processing Latency**
    - **Validates: Requirements 1.5**
  
  - [ ]* 6.7 Write unit tests for WebcamService
    - Test successful initialization
    - Test device enumeration
    - Test frame capture callback
    - Test resource cleanup
    - _Requirements: 1.1, 1.2, 1.5, 8.4_

- [x] 7. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement core UI components
  - [x] 8.1 Create App component with state management
    - Define AppState interface with webcam, color, bulb, ui, config states
    - Implement useReducer for state management
    - Initialize services (ConfigManager, WebcamService, ColorExtractor, ShellyController)
    - Implement initialization logic and error handling
    - _Requirements: 1.1, 3.1, 7.3_
  
  - [x] 8.2 Create VideoFeed component
    - Display live video stream from webcam
    - Show placeholder when webcam inactive
    - Ensure minimum 640x480 resolution
    - _Requirements: 1.4, 4.4_
  
  - [x] 8.3 Create ColorSwatch component
    - Display large color preview with current RGB
    - Show RGB values in readable text
    - Update within 100ms of color changes
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [x] 8.4 Create StatusIndicator component
    - Display connection status for webcam and bulb
    - Show visual states: connected, disconnected, connecting
    - Use clear icons and colors
    - _Requirements: 4.3_
  
  - [ ]* 8.5 Write property test for UI state consistency
    - **Property 8: UI State Consistency**
    - **Validates: Requirements 4.3, 5.1, 5.3**
  
  - [ ]* 8.6 Write property test for video stream display
    - **Property 22: Video Stream Display**
    - **Validates: Requirements 1.4**
  
  - [ ]* 8.7 Write property test for UI update responsiveness
    - **Property 18: UI Update Responsiveness**
    - **Validates: Requirements 4.5**
  
  - [ ]* 8.8 Write unit tests for UI components
    - Test component rendering with various props
    - Test status indicator states
    - Test color swatch updates
    - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. Implement manual fallback mode
  - [x] 9.1 Create ManualColorPicker component
    - Implement RGB sliders or color input
    - Show visual preview of selected color
    - Trigger color update on selection
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 9.2 Implement fallback mode switching
    - Switch to manual mode on webcam errors
    - Display clear fallback mode indicator
    - Provide reconnect button for webcam
    - _Requirements: 5.1, 5.3, 5.4_
  
  - [ ]* 9.3 Write property test for manual color picker integration
    - **Property 9: Manual Color Picker Integration**
    - **Validates: Requirements 5.2**
  
  - [ ]* 9.4 Write property test for webcam device selection
    - **Property 12: Webcam Device Selection**
    - **Validates: Requirements 8.4**
  
  - [ ]* 9.5 Write unit tests for manual mode
    - Test mode switching on errors
    - Test reconnect functionality
    - Test manual color selection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Implement settings panel
  - [x] 10.1 Create SettingsPanel component
    - Input field for Shelly bulb IP address
    - Webcam device selector dropdown
    - Connection test button
    - Save/reset configuration buttons
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 10.2 Write unit tests for settings panel
    - Test IP validation on input
    - Test connection test button
    - Test configuration save/load
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 11. Implement error handling and user feedback
  - [x] 11.1 Create error message formatting utilities
    - Map technical errors to user-friendly messages
    - Implement console logging for technical details
    - Create ErrorDisplay component for UI messages
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 11.2 Write property test for error message formatting
    - **Property 7: Error Message Formatting**
    - **Validates: Requirements 6.3, 6.4**
  
  - [ ]* 11.3 Write unit tests for error handling
    - Test error message mapping
    - Test console logging
    - Test error display component
    - _Requirements: 6.3, 6.4_

- [x] 12. Checkpoint - Ensure all UI and error handling tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Integrate components and implement main application flow
  - [x] 13.1 Wire webcam capture to color extraction
    - Connect WebcamService frame callback to ColorExtractor
    - Implement color change detection and throttling
    - _Requirements: 1.5, 2.1, 2.3_
  
  - [x] 13.2 Wire color extraction to Shelly controller
    - Connect ColorExtractor output to ShellyController
    - Implement request queuing and error handling
    - _Requirements: 3.2, 6.5_
  
  - [x] 13.3 Implement application initialization flow
    - Load configuration from ConfigManager
    - Initialize webcam with error handling
    - Connect to Shelly bulb with error handling
    - Complete initialization within 5 seconds
    - _Requirements: 1.1, 3.1, 7.3_
  
  - [ ]* 13.4 Write property test for end-to-end latency
    - **Property 19: End-to-End Latency**
    - **Validates: Requirements 7.1**
  
  - [ ]* 13.5 Write property test for initialization performance
    - **Property 20: Initialization Performance**
    - **Validates: Requirements 7.3**
  
  - [ ]* 13.6 Write property test for rapid update handling
    - **Property 21: Rapid Update Handling**
    - **Validates: Requirements 7.4**
  
  - [ ]* 13.7 Write integration tests
    - Test complete flow: webcam → color → bulb
    - Test error recovery flows
    - Test mode switching
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.3, 3.1, 3.2, 6.1, 6.2, 7.1, 7.3, 7.4_

- [ ] 14. Implement styling and visual polish
  - [x] 14.1 Create CSS modules for all components
    - Design clean, modern layout
    - Ensure large, visible color swatch
    - Make status indicators clear from distance
    - Ensure readable text sizes
    - Implement responsive design
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  
  - [x] 14.2 Add visual feedback and transitions
    - Smooth color transitions
    - Loading states for connections
    - Hover states for interactive elements
    - _Requirements: 4.5, 4.6_

- [ ] 15. Final testing and optimization
  - [x] 15.1 Run full test suite
    - Execute all unit tests
    - Execute all property tests (100+ iterations each)
    - Verify test coverage meets 80% target
    - _Requirements: All_
  
  - [x] 15.2 Performance testing and optimization
    - Test with actual webcam and Shelly bulb
    - Verify end-to-end latency <500ms
    - Test rapid color changes (>5/second)
    - Verify smooth 30 FPS UI rendering
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [x] 15.3 Browser compatibility testing
    - Test on Chrome, Firefox, Safari
    - Verify HTTPS requirement messaging
    - Test on different screen sizes
    - _Requirements: All_

- [x] 16. Final checkpoint - Demo rehearsal
  - Test complete demo flow with actual hardware
  - Verify error handling with simulated failures
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- TDD approach: write tests before implementation
- Critical path: Tasks 2-7 establish core services, Tasks 8-13 integrate them
- Demo-first: Prioritize reliability and visual feedback throughout

