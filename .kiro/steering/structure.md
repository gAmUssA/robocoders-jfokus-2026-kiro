# Project Structure

## Directory Organization

```
.
├── .kiro/                      # Kiro configuration and specs
│   ├── specs/                  # Feature specifications
│   │   └── shelly-iot-color-picker/
│   │       ├── requirements.md # User stories and acceptance criteria
│   │       ├── design.md       # Technical design and architecture
│   │       └── tasks.md        # Implementation task breakdown
│   └── steering/               # Project guidance documents
│       ├── product.md          # Product overview
│       ├── tech.md             # Technology stack and commands
│       └── structure.md        # This file
│
├── src/                        # Source code (to be created)
│   ├── components/             # React UI components
│   │   ├── App.tsx            # Main application component
│   │   ├── VideoFeed.tsx      # Webcam video display
│   │   ├── ColorSwatch.tsx    # Color preview display
│   │   ├── StatusIndicator.tsx # Connection status indicators
│   │   ├── ManualColorPicker.tsx # Fallback color picker
│   │   └── SettingsPanel.tsx  # Configuration UI
│   │
│   ├── services/              # Business logic services
│   │   ├── WebcamService.ts   # Webcam capture and frame extraction
│   │   ├── ColorExtractor.ts  # Dominant color analysis
│   │   └── ShellyController.ts # IoT bulb HTTP communication
│   │
│   ├── utils/                 # Utility functions
│   │   └── ConfigManager.ts   # Configuration persistence
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared types (RGB, AppState, etc.)
│   │
│   └── main.tsx               # Application entry point
│
└── tests/                     # Test files (co-located with source)
    ├── *.test.ts              # Unit tests
    └── *.properties.test.ts   # Property-based tests
```

## Architecture Layers

### UI Layer (components/)
React components for visual interface, user interactions, and status display. Each component is self-contained with its own styles (CSS Modules).

### Service Layer (services/)
Business logic for webcam capture, color extraction, and IoT control. Services are framework-agnostic and testable in isolation.

### Utility Layer (utils/)
Configuration management, validation, and helper functions. Pure functions where possible.

## File Naming Conventions

- Components: PascalCase (e.g., `ColorSwatch.tsx`)
- Services: PascalCase (e.g., `WebcamService.ts`)
- Tests: Same name as source with `.test.ts` or `.properties.test.ts` suffix
- Styles: Same name as component with `.module.css` suffix
- Types: lowercase with dashes (e.g., `app-state.ts`)

## Test Organization

Tests are co-located with source files for easy discovery:
- `ComponentName.test.tsx` - Unit tests for components
- `ServiceName.test.ts` - Unit tests for services
- `ServiceName.properties.test.ts` - Property-based tests

## Code Organization Principles

1. **Separation of Concerns**: UI, business logic, and utilities are clearly separated
2. **Testability**: Services are independent and mockable
3. **Type Safety**: TypeScript interfaces define all contracts
4. **Component Isolation**: Each component manages its own state and styles
5. **Demo-First**: Reliability and error handling prioritized throughout
