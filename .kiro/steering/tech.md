# Technology Stack

## Frontend

- **Framework**: React 18+ with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React hooks (useState, useEffect, useReducer)
- **Styling**: CSS Modules for scoped component styles

## Browser APIs

- **Webcam Access**: MediaStream API (getUserMedia)
- **Color Extraction**: Canvas API with custom k-means clustering
- **HTTP Client**: Fetch API with AbortController for timeouts
- **Storage**: localStorage for configuration persistence

## Testing

- **Unit Tests**: Vitest with React Testing Library
- **Property-Based Tests**: fast-check (minimum 100 iterations per test)
- **Coverage Target**: 80% line coverage for business logic

## IoT Integration

- **Device**: Shelly Gen1 smart bulb
- **Protocol**: HTTP REST API
- **Endpoint Format**: `http://<ip>/color/0?turn=on&red=<r>&green=<g>&blue=<b>`
- **Timeout**: 2 seconds per request

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

## Browser Requirements

- Modern browsers with MediaStream API support
- Chrome 53+, Firefox 36+, Safari 11+
- HTTPS required for webcam access (localhost OK for dev)

## Performance Targets

- Frame capture: 10+ FPS
- Color extraction: <100ms per frame
- Shelly update: <200ms from color determination
- End-to-end latency: <500ms
- UI frame rate: 30+ FPS
