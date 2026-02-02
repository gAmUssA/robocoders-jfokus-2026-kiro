// Shared TypeScript type definitions for the Shelly IoT Color Picker

// RGB color representation
export interface RGB {
  red: number    // 0-255
  green: number  // 0-255
  blue: number   // 0-255
}

// Webcam-related types
export type WebcamError = 
  | 'permission-denied'
  | 'device-not-found'
  | 'device-in-use'
  | 'unknown-error'

export type WebcamResult = 
  | { success: true; stream: MediaStream }
  | { success: false; error: WebcamError }

// Shelly bulb-related types
export type ShellyError =
  | 'network-error'
  | 'timeout'
  | 'invalid-response'
  | 'bulb-offline'

export interface ShellyStatus {
  isOn: boolean
  brightness: number
  red: number
  green: number
  blue: number
  source: string
}

export type ShellyResult =
  | { success: true; status: ShellyStatus }
  | { success: false; error: ShellyError }

// Configuration types
export interface AppConfig {
  shellyBulbIp: string
  selectedWebcamId: string | null
  captureFrameRate: number  // FPS
  colorChangeThreshold: number  // 0-255
  autoReconnect: boolean
}

// Application state types
export interface AppState {
  // Webcam state
  webcam: {
    status: 'inactive' | 'initializing' | 'active' | 'error'
    error: WebcamError | null
    availableDevices: MediaDeviceInfo[]
    stream: MediaStream | null
  }
  
  // Color state
  color: {
    current: RGB
    previous: RGB
    lastUpdate: number  // timestamp
  }
  
  // Shelly bulb state
  bulb: {
    status: 'disconnected' | 'connecting' | 'connected' | 'error'
    error: ShellyError | null
    lastSuccessfulUpdate: number  // timestamp
    reconnectAttempts: number
  }
  
  // UI state
  ui: {
    mode: 'automatic' | 'manual'
    showSettings: boolean
    isInitializing: boolean
  }
  
  // Configuration
  config: AppConfig
}

// Color extraction options
export interface ExtractionOptions {
  // Ignore pure black and white pixels
  ignoreExtremes: boolean
  
  // Number of clusters for k-means (default: 5)
  clusters: number
  
  // Sample every Nth pixel for performance (default: 4)
  sampleRate: number
}
