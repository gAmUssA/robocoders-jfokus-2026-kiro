# Implementation Plan: HUD / Sci-Fi FUI Refactor

## Overview

This implementation plan refactors the Shelly IoT Color Picker UI to a professional HUD/Sci-Fi FUI design. The work is primarily CSS-focused, enhancing the existing partial HUD theme in `src/index.css` and component CSS modules. The implementation follows a layered approach: global theme first, then component-specific enhancements.

## Tasks

- [ ] 1. Enhance Global Theme Foundation
  - [x] 1.1 Update CSS variables in index.css to ensure all required theme tokens are defined
    - Verify/add color variables (--hud-primary, --hud-accent, --hud-warning, --hud-error, etc.)
    - Verify/add typography variables (--font-display, --font-mono, --font-body)
    - Verify/add spacing variables (--space-xs through --space-2xl)
    - Verify/add timing variables (--transition-fast, --transition-normal, --transition-slow)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 1.2 Enhance global animations in index.css
    - Verify hud-pulse animation (opacity 100% to 50% over 2s)
    - Verify hud-scan animation for scan line effect
    - Verify hud-glow-pulse animation for interactive elements
    - Verify hud-data-stream animation for panel borders
    - Ensure all animations are ≤4 seconds duration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  
  - [x] 1.3 Add prefers-reduced-motion media query support
    - Disable all animations when user prefers reduced motion
    - Remove scan line overlay (body::before)
    - Set transition-duration to 0.01ms
    - _Requirements: 2.5, 11.2_
  
  - [ ]* 1.4 Write property test for animation duration bounds
    - **Property 1: Animation Duration Bounds**
    - **Validates: Requirements 2.6**

- [x] 2. Checkpoint - Verify global theme
  - Ensure all CSS variables are defined
  - Ensure animations work correctly
  - Ensure reduced motion is respected
  - Ask the user if questions arise

- [ ] 3. Enhance App Component Styling
  - [x] 3.1 Update App.module.css with enhanced HUD styling
    - Verify corner decorations on main container
    - Enhance header with animated data stream border
    - Style mode indicator with status-colored glow
    - Style settings button with hover animation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [~] 3.2 Add responsive styles for App component
    - Mobile (< 768px): Single column, reduced spacing
    - Desktop (768px+): Two column grid layout
    - Large (1920px+): Increased sizes for conference display
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 4. Enhance ColorSwatch Component
  - [~] 4.1 Update ColorSwatch.module.css with enhanced styling
    - Ensure minimum height (280px standard, 400px large)
    - Add holographic shine effect overlay
    - Style RGB values with large monospace text and glow
    - Add corner brackets inside swatch
    - Style individual R/G/B channel boxes with color-coded borders
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_
  
  - [~] 4.2 Verify ColorSwatch transition timing
    - Ensure background-color transition is ≤100ms
    - _Requirements: 4.5_
  
  - [~] 4.3 Update ColorSwatch.tsx to include aria-label with RGB values
    - Add aria-label attribute to swatch element
    - Format: "Color swatch showing RGB {red}, {green}, {blue}"
    - _Requirements: 11.4_
  
  - [ ]* 4.4 Write property test for ColorSwatch ARIA label accuracy
    - **Property 4: ColorSwatch ARIA Label Accuracy**
    - **Validates: Requirements 11.4**

- [ ] 5. Enhance StatusIndicator Component
  - [~] 5.1 Update StatusIndicator.module.css with enhanced styling
    - Add status-colored top border (2px)
    - Style indicator dot with glow effect per status
    - Add pulsing ring animation for connecting state
    - Style icon with status-colored glow
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  
  - [~] 5.2 Verify StatusIndicator accessibility
    - Ensure ARIA labels describe device and status
    - Ensure status text accompanies colored indicators
    - _Requirements: 11.3, 11.6_
  
  - [ ]* 5.3 Write property test for status border colors
    - **Property 2: Status State Border Colors**
    - **Validates: Requirements 3.5, 5.5**

- [~] 6. Checkpoint - Verify core components
  - Test ColorSwatch at various colors
  - Test StatusIndicator in all states
  - Verify responsive behavior
  - Ask the user if questions arise

- [ ] 7. Enhance VideoFeed Component
  - [~] 7.1 Update VideoFeed.module.css with enhanced styling
    - Ensure minimum resolution display (640x480)
    - Add corner brackets (40px size)
    - Style placeholder with grid pattern and scan line
    - Add video filters (contrast 1.05, saturation 1.1)
    - Add pulsing animation to placeholder icon
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Enhance ManualColorPicker Component
  - [~] 8.1 Update ManualColorPicker.module.css with enhanced styling
    - Style RGB sliders with gradient tracks
    - Add color-coded channel borders (red, green, cyan)
    - Style preset color buttons with hover effects
    - Style range input thumb with primary accent color
    - _Requirements: 7.1, 7.3, 7.4_
  
  - [~] 8.2 Verify ManualColorPicker functionality
    - Ensure preview updates in real-time with slider changes
    - Ensure preset buttons update sliders and preview immediately
    - _Requirements: 7.2, 7.5_

- [ ] 9. Enhance SettingsPanel Component
  - [~] 9.1 Update SettingsPanel.module.css with enhanced styling
    - Style modal overlay with blur backdrop
    - Apply FUI panel styling with decorations
    - Style form inputs with HUD theme
    - Add panel appear animation (fade, 200ms)
    - Style close button with HUD theme
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_
  
  - [~] 9.2 Verify Test Connection button feedback
    - Ensure visual feedback on success (green) and failure (red)
    - _Requirements: 8.4_

- [ ] 10. Enhance ErrorDisplay Component
  - [~] 10.1 Update ErrorDisplay.module.css with enhanced styling
    - Style as FUI panel with red border
    - Add "SYSTEM ALERT" header styling
    - Style error messages with monospace font and left border
    - Style reconnect button with primary accent color
    - Add glow-pulse animation on border
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [~] 11. Checkpoint - Verify all components
  - Test all components visually
  - Verify responsive behavior at all breakpoints
  - Test reduced motion preference
  - Ask the user if questions arise

- [ ] 12. Accessibility and Contrast Verification
  - [~] 12.1 Verify text contrast ratios meet WCAG AA (4.5:1)
    - Check primary text on dark backgrounds
    - Check secondary text on panel backgrounds
    - Check status text colors
    - _Requirements: 11.1_
  
  - [~] 12.2 Verify focus states for interactive elements
    - Ensure all buttons have visible focus states
    - Ensure all inputs have visible focus states
    - Use primary accent color for focus indicators
    - _Requirements: 11.5_
  
  - [ ]* 12.3 Write property test for contrast ratio compliance
    - **Property 3: Text Contrast Ratio Compliance**
    - **Validates: Requirements 11.1**

- [ ] 13. CSS Variable Completeness Verification
  - [~] 13.1 Audit all component CSS files for variable references
    - Ensure all --hud-* variables are defined in index.css
    - _Requirements: 1.5_
  
  - [ ]* 13.2 Write property test for CSS variable completeness
    - **Property 5: CSS Variable Completeness**
    - **Validates: Requirements 1.5**

- [~] 14. Final Checkpoint - Complete verification
  - Run all tests
  - Verify visual appearance matches HUD/Sci-Fi FUI design
  - Test on different screen sizes (mobile, desktop, large)
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- This refactor is primarily CSS-focused with minimal React component changes
- The existing HUD theme in index.css provides a solid foundation
- Property-based tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
