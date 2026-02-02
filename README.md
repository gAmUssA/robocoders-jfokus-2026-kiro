# Shelly IoT Color Picker

A live conference demonstration application for JFokus 2026 that captures the dominant color from a webcam feed in real-time and transmits it to a Shelly Gen1 IoT smart bulb.

## Features

- Real-time webcam color capture and analysis
- Live IoT bulb control via HTTP API
- Manual fallback mode for reliability
- Audience-friendly visual feedback
- Graceful error handling for live demos

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest with React Testing Library
- **Property-Based Testing**: fast-check (100+ iterations per test)
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern browser with MediaStream API support (Chrome 53+, Firefox 36+, Safari 11+)
- HTTPS connection (or localhost for development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # React UI components
├── services/         # Business logic services
│   ├── WebcamService.ts      # Webcam capture
│   ├── ColorExtractor.ts     # Color analysis
│   └── ShellyController.ts   # IoT bulb control
├── utils/            # Utility functions
│   └── ConfigManager.ts      # Configuration persistence
├── types/            # TypeScript type definitions
└── test/             # Test setup and utilities
```

## Configuration

The application can be configured through the settings panel:

- **Shelly Bulb IP**: IP address of your Shelly Gen1 smart bulb
- **Webcam Device**: Select from available webcam devices
- **Frame Rate**: Capture frame rate (default: 10 FPS)
- **Color Threshold**: Sensitivity for color changes (default: 25.5)

## Performance Targets

- Frame capture: 10+ FPS
- Color extraction: <100ms per frame
- Shelly update: <200ms from color determination
- End-to-end latency: <500ms
- UI frame rate: 30+ FPS

## Testing

The project uses a dual testing approach:

- **Unit Tests**: Specific examples and edge cases
- **Property-Based Tests**: Universal properties with 100+ iterations

Run tests with:
```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:ui       # Visual test UI
```

## License

MIT
