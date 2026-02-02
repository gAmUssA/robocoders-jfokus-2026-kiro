/**
 * App Component - Main application component with state management
 * 
 * Responsibilities:
 * - Manage application state using useReducer
 * - Initialize and coordinate services (WebcamService, ColorExtractor, ShellyController)
 * - Handle application lifecycle (initialization, cleanup)
 * - Coordinate webcam capture -> color extraction -> bulb control flow
 * - Handle errors gracefully and switch between automatic/manual modes
 * - Provide fallback mode with manual color picker when webcam fails
 * 
 * Requirements: 1.1, 3.1, 5.1, 5.3, 5.4, 7.3
 */

import { useReducer, useEffect, useRef, useCallback } from 'react'
import type { AppState, RGB, WebcamResult, ShellyResult } from '../types'
import { ConfigManager } from '../utils/ConfigManager'
import { createWebcamService } from '../services/WebcamService'
import type { WebcamService } from '../services/WebcamService'
import { ColorExtractor } from '../services/ColorExtractor'
import { createShellyController } from '../services/ShellyController'
import type { ShellyController } from '../services/ShellyController'
import { hasSignificantChange } from '../utils/colorUtils'
import { ManualColorPicker } from './ManualColorPicker'
import { SettingsPanel } from './SettingsPanel'
import styles from './App.module.css'

// Action types for state management
type AppAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_COMPLETE' }
  | { type: 'WEBCAM_INITIALIZING' }
  | { type: 'WEBCAM_ACTIVE'; stream: MediaStream; devices: MediaDeviceInfo[] }
  | { type: 'WEBCAM_ERROR'; error: string }
  | { type: 'WEBCAM_INACTIVE' }
  | { type: 'COLOR_UPDATE'; color: RGB }
  | { type: 'BULB_CONNECTING' }
  | { type: 'BULB_CONNECTED' }
  | { type: 'BULB_DISCONNECTED' }
  | { type: 'BULB_ERROR'; error: string }
  | { type: 'BULB_UPDATE_SUCCESS'; timestamp: number }
  | { type: 'BULB_RECONNECT_ATTEMPT'; attempts: number }
  | { type: 'MODE_SWITCH'; mode: 'automatic' | 'manual' }
  | { type: 'SETTINGS_TOGGLE' }
  | { type: 'CONFIG_UPDATE'; config: Partial<AppState['config']> }

// Initial state
const createInitialState = (configManager: ConfigManager): AppState => {
  const config = configManager.getConfig()
  
  return {
    webcam: {
      status: 'inactive',
      error: null,
      availableDevices: [],
      stream: null
    },
    color: {
      current: { red: 128, green: 128, blue: 128 },
      previous: { red: 128, green: 128, blue: 128 },
      lastUpdate: 0
    },
    bulb: {
      status: 'disconnected',
      error: null,
      lastSuccessfulUpdate: 0,
      reconnectAttempts: 0
    },
    ui: {
      mode: 'automatic',
      showSettings: false,
      isInitializing: true
    },
    config
  }
}

// Reducer function for state management
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT_START':
      return {
        ...state,
        ui: { ...state.ui, isInitializing: true }
      }
    
    case 'INIT_COMPLETE':
      return {
        ...state,
        ui: { ...state.ui, isInitializing: false }
      }
    
    case 'WEBCAM_INITIALIZING':
      return {
        ...state,
        webcam: {
          ...state.webcam,
          status: 'initializing',
          error: null
        }
      }
    
    case 'WEBCAM_ACTIVE':
      return {
        ...state,
        webcam: {
          status: 'active',
          error: null,
          availableDevices: action.devices,
          stream: action.stream
        },
        ui: {
          ...state.ui,
          mode: 'automatic'
        }
      }
    
    case 'WEBCAM_ERROR':
      return {
        ...state,
        webcam: {
          ...state.webcam,
          status: 'error',
          error: action.error as any,
          stream: null
        },
        ui: {
          ...state.ui,
          mode: 'manual' // Switch to manual mode on webcam error
        }
      }
    
    case 'WEBCAM_INACTIVE':
      return {
        ...state,
        webcam: {
          ...state.webcam,
          status: 'inactive',
          stream: null
        }
      }
    
    case 'COLOR_UPDATE':
      return {
        ...state,
        color: {
          current: action.color,
          previous: state.color.current,
          lastUpdate: Date.now()
        }
      }
    
    case 'BULB_CONNECTING':
      return {
        ...state,
        bulb: {
          ...state.bulb,
          status: 'connecting',
          error: null
        }
      }
    
    case 'BULB_CONNECTED':
      return {
        ...state,
        bulb: {
          ...state.bulb,
          status: 'connected',
          error: null,
          reconnectAttempts: 0
        }
      }
    
    case 'BULB_DISCONNECTED':
      return {
        ...state,
        bulb: {
          ...state.bulb,
          status: 'disconnected',
          error: null
        }
      }
    
    case 'BULB_ERROR':
      return {
        ...state,
        bulb: {
          ...state.bulb,
          status: 'error',
          error: action.error as any
        }
      }
    
    case 'BULB_UPDATE_SUCCESS':
      return {
        ...state,
        bulb: {
          ...state.bulb,
          status: 'connected',
          error: null,
          lastSuccessfulUpdate: action.timestamp,
          reconnectAttempts: 0
        }
      }
    
    case 'BULB_RECONNECT_ATTEMPT':
      return {
        ...state,
        bulb: {
          ...state.bulb,
          reconnectAttempts: action.attempts
        }
      }
    
    case 'MODE_SWITCH':
      return {
        ...state,
        ui: {
          ...state.ui,
          mode: action.mode
        }
      }
    
    case 'SETTINGS_TOGGLE':
      return {
        ...state,
        ui: {
          ...state.ui,
          showSettings: !state.ui.showSettings
        }
      }
    
    case 'CONFIG_UPDATE':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.config
        }
      }
    
    default:
      return state
  }
}

export function App() {
  // Initialize services
  const configManagerRef = useRef<ConfigManager>(new ConfigManager())
  const webcamServiceRef = useRef<WebcamService>(createWebcamService())
  const colorExtractorRef = useRef<ColorExtractor>(new ColorExtractor())
  const shellyControllerRef = useRef<ShellyController | null>(null)
  
  // State management
  const [state, dispatch] = useReducer(
    appReducer,
    configManagerRef.current,
    createInitialState
  )
  
  // Initialize Shelly controller when config changes
  useEffect(() => {
    shellyControllerRef.current = createShellyController(state.config.shellyBulbIp)
  }, [state.config.shellyBulbIp])
  
  /**
   * Initialize application on mount
   * Requirements: 1.1, 3.1, 7.3
   */
  useEffect(() => {
    const initializeApp = async () => {
      dispatch({ type: 'INIT_START' })
      
      try {
        // Initialize webcam
        await initializeWebcam()
        
        // Test bulb connection
        await testBulbConnection()
        
        dispatch({ type: 'INIT_COMPLETE' })
      } catch (error) {
        console.error('Initialization error:', error)
        dispatch({ type: 'INIT_COMPLETE' })
      }
    }
    
    initializeApp()
    
    // Cleanup on unmount
    return () => {
      webcamServiceRef.current.stopCapture()
      if (shellyControllerRef.current) {
        shellyControllerRef.current.stopReconnection()
      }
    }
  }, [])
  
  /**
   * Initialize webcam with error handling
   * Requirements: 1.1, 1.3, 6.1
   */
  const initializeWebcam = async () => {
    dispatch({ type: 'WEBCAM_INITIALIZING' })
    
    try {
      // Get available devices
      const devices = await webcamServiceRef.current.getAvailableDevices()
      
      // Initialize with selected device or default
      const result: WebcamResult = await webcamServiceRef.current.initialize(
        state.config.selectedWebcamId
      )
      
      if (result.success) {
        dispatch({
          type: 'WEBCAM_ACTIVE',
          stream: result.stream,
          devices
        })
        
        // Start frame capture
        startFrameCapture()
      } else {
        // Handle webcam error - switch to manual mode
        dispatch({
          type: 'WEBCAM_ERROR',
          error: result.error
        })
        
        console.error('Webcam initialization failed:', result.error)
      }
    } catch (error) {
      dispatch({
        type: 'WEBCAM_ERROR',
        error: 'unknown-error'
      })
      
      console.error('Webcam initialization error:', error)
    }
  }
  
  /**
   * Start capturing frames from webcam
   * Requirements: 1.2, 1.5, 2.1
   */
  const startFrameCapture = () => {
    webcamServiceRef.current.startCapture(
      state.config.captureFrameRate,
      handleFrameCapture
    )
  }
  
  /**
   * Handle captured frame - extract color and update bulb
   * Requirements: 1.5, 2.1, 2.3, 3.2
   */
  const handleFrameCapture = async (imageData: ImageData) => {
    try {
      // Extract dominant color
      const color = colorExtractorRef.current.extractDominantColor(imageData, {
        ignoreExtremes: true,
        clusters: 5,
        sampleRate: 4
      })
      
      // Check if color has changed significantly
      const hasChanged = hasSignificantChange(
        state.color.current,
        color,
        state.config.colorChangeThreshold
      )
      
      if (hasChanged) {
        // Update color state
        dispatch({ type: 'COLOR_UPDATE', color })
        
        // Send color to bulb
        await updateBulbColor(color)
      }
    } catch (error) {
      console.error('Frame capture error:', error)
    }
  }
  
  /**
   * Update bulb color via Shelly controller
   * Requirements: 3.2, 3.3, 6.2, 6.5
   */
  const updateBulbColor = async (color: RGB) => {
    if (!shellyControllerRef.current) {
      return
    }
    
    try {
      const result: ShellyResult = await shellyControllerRef.current.setColor(color)
      
      if (result.success) {
        dispatch({
          type: 'BULB_UPDATE_SUCCESS',
          timestamp: Date.now()
        })
      } else {
        // Handle bulb error - don't crash, just log and update state
        dispatch({
          type: 'BULB_ERROR',
          error: result.error
        })
        
        console.error('Bulb update failed:', result.error)
        
        // Start reconnection if auto-reconnect is enabled
        if (state.config.autoReconnect) {
          shellyControllerRef.current.startReconnection()
        }
      }
    } catch (error) {
      console.error('Bulb update error:', error)
      dispatch({
        type: 'BULB_ERROR',
        error: 'network-error'
      })
    }
  }
  
  /**
   * Test bulb connection on initialization
   * Requirements: 3.1, 8.3
   */
  const testBulbConnection = async () => {
    if (!shellyControllerRef.current) {
      return
    }
    
    dispatch({ type: 'BULB_CONNECTING' })
    
    try {
      const isConnected = await shellyControllerRef.current.testConnection()
      
      if (isConnected) {
        dispatch({ type: 'BULB_CONNECTED' })
      } else {
        dispatch({ type: 'BULB_DISCONNECTED' })
        
        // Start reconnection if auto-reconnect is enabled
        if (state.config.autoReconnect) {
          shellyControllerRef.current.startReconnection()
        }
      }
    } catch (error) {
      console.error('Bulb connection test error:', error)
      dispatch({ type: 'BULB_DISCONNECTED' })
    }
  }
  
  /**
   * Handle manual color selection from ManualColorPicker
   * Requirements: 5.2 - Manual color selection uses same mechanism as automatic mode
   */
  const handleManualColorSelect = useCallback(async (color: RGB) => {
    // Update color state
    dispatch({ type: 'COLOR_UPDATE', color })
    
    // Send color to bulb using same mechanism as automatic mode
    await updateBulbColor(color)
  }, [])
  
  /**
   * Handle webcam reconnection attempt
   * Requirements: 5.4 - Allow user to attempt to reconnect to webcam
   */
  const handleReconnectWebcam = useCallback(async () => {
    await initializeWebcam()
  }, [state.config.selectedWebcamId])
  
  /**
   * Toggle settings panel visibility
   * Requirements: 8.1
   */
  const handleToggleSettings = useCallback(() => {
    dispatch({ type: 'SETTINGS_TOGGLE' })
  }, [])
  
  /**
   * Handle configuration changes from SettingsPanel
   * Requirements: 8.1, 8.5
   */
  const handleConfigChange = useCallback((newConfig: Partial<typeof state.config>) => {
    // Update state
    dispatch({ type: 'CONFIG_UPDATE', config: newConfig })
    
    // Persist to localStorage
    configManagerRef.current.updateConfig(newConfig)
    
    // Close settings panel
    dispatch({ type: 'SETTINGS_TOGGLE' })
  }, [])
  
  /**
   * Test Shelly bulb connection from settings panel
   * Requirements: 8.3
   */
  const handleTestConnection = useCallback(async (): Promise<boolean> => {
    if (!shellyControllerRef.current) {
      return false
    }
    return await shellyControllerRef.current.testConnection()
  }, [])
  
  // Determine if we're in manual/fallback mode
  const isManualMode = state.ui.mode === 'manual'
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shelly IoT Color Picker</h1>
        
        {/* Mode Indicator - Requirements: 5.3 */}
        <div 
          className={`${styles.modeIndicator} ${isManualMode ? styles.manualMode : styles.automaticMode}`}
          data-testid="mode-indicator"
        >
          <span className={styles.modeText}>
            {isManualMode ? 'Manual Mode' : 'Auto Mode'}
          </span>
        </div>
        
        {/* Settings Button - Requirements: 8.1 */}
        <button
          className={styles.settingsButton}
          onClick={handleToggleSettings}
          data-testid="settings-button"
          aria-label="Open settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>
      
      <main className={styles.main}>
        <div className={styles.statusSection}>
          <h2>Status</h2>
          <p>Initializing: {state.ui.isInitializing ? 'Yes' : 'No'}</p>
          <p>Mode: {state.ui.mode}</p>
          <p>Webcam: {state.webcam.status}</p>
          <p>Bulb: {state.bulb.status}</p>
        </div>
        
        <div className={styles.colorSection}>
          <h2>Current Color</h2>
          <div
            className={styles.colorSwatch}
            style={{
              backgroundColor: `rgb(${state.color.current.red}, ${state.color.current.green}, ${state.color.current.blue})`
            }}
          />
          <p>
            RGB: ({state.color.current.red}, {state.color.current.green}, {state.color.current.blue})
          </p>
        </div>
        
        {/* Manual Color Picker - Requirements: 5.1 */}
        {isManualMode && (
          <div className={styles.manualPickerSection}>
            <ManualColorPicker
              onColorSelect={handleManualColorSelect}
              currentColor={state.color.current}
            />
          </div>
        )}
        
        {/* Error Messages */}
        {state.webcam.error && (
          <div className={styles.errorSection}>
            <h3>Webcam Error</h3>
            <p className={styles.errorMessage}>{state.webcam.error}</p>
            
            {/* Reconnect Button - Requirements: 5.4 */}
            <button
              className={styles.reconnectButton}
              onClick={handleReconnectWebcam}
              data-testid="reconnect-webcam-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Reconnect Webcam
            </button>
          </div>
        )}
        
        {state.bulb.error && (
          <div className={styles.warningSection}>
            <h3>Bulb Error</h3>
            <p>{state.bulb.error}</p>
          </div>
        )}
      </main>
      
      {/* Settings Panel - Requirements: 8.1, 8.2, 8.3, 8.4 */}
      {state.ui.showSettings && (
        <div className={styles.settingsOverlay}>
          <SettingsPanel
            config={state.config}
            availableDevices={state.webcam.availableDevices}
            onConfigChange={handleConfigChange}
            onTestConnection={handleTestConnection}
            onClose={handleToggleSettings}
          />
        </div>
      )}
    </div>
  )
}
