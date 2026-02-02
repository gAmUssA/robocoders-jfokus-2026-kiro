/**
 * Unit tests for App component
 * 
 * Tests:
 * - Component renders without crashing
 * - Initial state is correct
 * - Webcam initialization is attempted on mount
 * - Bulb connection test is attempted on mount
 * - State updates correctly on actions
 * - Error handling for webcam failures
 * - Error handling for bulb failures
 * - Mode switching on webcam errors
 * - Fallback mode switching (Requirements: 5.1, 5.3, 5.4)
 *   - Shows ManualColorPicker when in manual mode
 *   - Displays clear fallback mode indicator
 *   - Provides reconnect button for webcam
 *   - Manual color selection updates bulb
 * 
 * Requirements: 1.1, 3.1, 5.1, 5.3, 5.4, 6.1, 6.2, 7.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { App } from './App'
import type { WebcamResult } from '../types'

// Mock MediaStream for test environment
class MockMediaStream {
  getTracks() {
    return []
  }
}

// @ts-ignore - Mock global MediaStream
global.MediaStream = MockMediaStream as any

// Create mock instances that will be reused
const mockWebcamServiceInstance = {
  initialize: vi.fn(),
  getAvailableDevices: vi.fn(),
  startCapture: vi.fn(),
  stopCapture: vi.fn(),
  getVideoStream: vi.fn(),
  isActive: vi.fn()
}

const mockShellyControllerInstance = {
  setColor: vi.fn(),
  testConnection: vi.fn(),
  getStatus: vi.fn(),
  updateBulbAddress: vi.fn(),
  isConnected: vi.fn(),
  isReconnecting: vi.fn(),
  startReconnection: vi.fn(),
  stopReconnection: vi.fn()
}

// Mock the services
vi.mock('../services/WebcamService', () => ({
  createWebcamService: vi.fn(() => mockWebcamServiceInstance)
}))

vi.mock('../services/ShellyController', () => ({
  createShellyController: vi.fn(() => mockShellyControllerInstance)
}))

vi.mock('../services/ColorExtractor', () => ({
  ColorExtractor: vi.fn(function() {
    return {
      extractDominantColor: vi.fn(() => ({ red: 128, green: 128, blue: 128 }))
    }
  })
}))

vi.mock('../utils/ConfigManager', () => ({
  ConfigManager: vi.fn(function() {
    return {
      getConfig: vi.fn(() => ({
        shellyBulbIp: '192.168.1.100',
        selectedWebcamId: null,
        captureFrameRate: 10,
        colorChangeThreshold: 25.5,
        autoReconnect: true
      })),
      updateConfig: vi.fn(),
      validateIpAddress: vi.fn(),
      resetToDefaults: vi.fn()
    }
  })
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default mock implementations
    mockWebcamServiceInstance.initialize.mockResolvedValue({ success: false, error: 'unknown-error' })
    mockWebcamServiceInstance.getAvailableDevices.mockResolvedValue([])
    mockWebcamServiceInstance.getVideoStream.mockReturnValue(null)
    mockWebcamServiceInstance.isActive.mockReturnValue(false)
    
    mockShellyControllerInstance.setColor.mockResolvedValue({ success: true, status: {} })
    mockShellyControllerInstance.testConnection.mockResolvedValue(false)
    mockShellyControllerInstance.getStatus.mockResolvedValue(null)
    mockShellyControllerInstance.isConnected.mockReturnValue(false)
    mockShellyControllerInstance.isReconnecting.mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render without crashing', () => {
    render(<App />)
    expect(screen.getByText('Shelly IoT Color Picker')).toBeInTheDocument()
  })

  it('should display initial status information', () => {
    render(<App />)
    
    expect(screen.getByText(/Status/i)).toBeInTheDocument()
    expect(screen.getByText(/Mode:/i)).toBeInTheDocument()
    expect(screen.getByText(/Webcam:/i)).toBeInTheDocument()
    expect(screen.getByText(/Bulb:/i)).toBeInTheDocument()
  })

  it('should display current color swatch', () => {
    render(<App />)
    
    expect(screen.getByText(/Current Color/i)).toBeInTheDocument()
    expect(screen.getByText(/RGB:/i)).toBeInTheDocument()
  })

  it('should start in initializing state', () => {
    render(<App />)
    
    expect(screen.getByText(/Initializing: Yes/i)).toBeInTheDocument()
  })

  it('should attempt webcam initialization on mount', async () => {
    mockWebcamServiceInstance.initialize.mockResolvedValue({
      success: true,
      stream: new MediaStream()
    } as WebcamResult)
    
    render(<App />)
    
    await waitFor(() => {
      expect(mockWebcamServiceInstance.initialize).toHaveBeenCalled()
    })
  })

  it('should attempt bulb connection test on mount', async () => {
    mockShellyControllerInstance.testConnection.mockResolvedValue(true)
    
    render(<App />)
    
    await waitFor(() => {
      expect(mockShellyControllerInstance.testConnection).toHaveBeenCalled()
    })
  })

  it('should switch to manual mode on webcam error', async () => {
    mockWebcamServiceInstance.initialize.mockResolvedValue({
      success: false,
      error: 'permission-denied'
    } as WebcamResult)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Mode: manual/i)).toBeInTheDocument()
    })
  })

  it('should display webcam error message when webcam fails', async () => {
    mockWebcamServiceInstance.initialize.mockResolvedValue({
      success: false,
      error: 'permission-denied'
    } as WebcamResult)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Webcam Error/i)).toBeInTheDocument()
      expect(screen.getByText('permission-denied')).toBeInTheDocument()
    })
  })

  it('should complete initialization after setup', async () => {
    mockWebcamServiceInstance.initialize.mockResolvedValue({
      success: true,
      stream: new MediaStream()
    } as WebcamResult)
    mockShellyControllerInstance.testConnection.mockResolvedValue(true)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Initializing: No/i)).toBeInTheDocument()
    })
  })

  it('should cleanup resources on unmount', async () => {
    mockWebcamServiceInstance.initialize.mockResolvedValue({
      success: true,
      stream: new MediaStream()
    } as WebcamResult)
    
    const { unmount } = render(<App />)
    
    unmount()
    
    expect(mockWebcamServiceInstance.stopCapture).toHaveBeenCalled()
    expect(mockShellyControllerInstance.stopReconnection).toHaveBeenCalled()
  })

  it('should display bulb status correctly', async () => {
    mockShellyControllerInstance.testConnection.mockResolvedValue(true)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Bulb: connected')).toBeInTheDocument()
    })
  })

  it('should handle bulb connection failure gracefully', async () => {
    mockShellyControllerInstance.testConnection.mockResolvedValue(false)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Bulb: disconnected')).toBeInTheDocument()
    })
  })

  // Fallback mode switching tests (Requirements: 5.1, 5.3, 5.4)
  describe('Fallback Mode Switching', () => {
    it('should display ManualColorPicker when in manual mode (Requirement 5.1)', async () => {
      mockWebcamServiceInstance.initialize.mockResolvedValue({
        success: false,
        error: 'permission-denied'
      } as WebcamResult)
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('manual-color-picker')).toBeInTheDocument()
      })
    })

    it('should display clear fallback mode indicator (Requirement 5.3)', async () => {
      mockWebcamServiceInstance.initialize.mockResolvedValue({
        success: false,
        error: 'device-not-found'
      } as WebcamResult)
      
      render(<App />)
      
      await waitFor(() => {
        // Should show a clear indicator that we're in manual/fallback mode
        expect(screen.getByTestId('mode-indicator')).toBeInTheDocument()
        expect(screen.getByTestId('mode-indicator')).toHaveTextContent(/manual/i)
      })
    })

    it('should provide reconnect button when in fallback mode (Requirement 5.4)', async () => {
      mockWebcamServiceInstance.initialize.mockResolvedValue({
        success: false,
        error: 'permission-denied'
      } as WebcamResult)
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('reconnect-webcam-button')).toBeInTheDocument()
      })
    })

    it('should attempt webcam reconnection when reconnect button is clicked', async () => {
      mockWebcamServiceInstance.initialize
        .mockResolvedValueOnce({
          success: false,
          error: 'permission-denied'
        } as WebcamResult)
        .mockResolvedValueOnce({
          success: true,
          stream: new MediaStream()
        } as WebcamResult)
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('reconnect-webcam-button')).toBeInTheDocument()
      })
      
      // Click reconnect button
      fireEvent.click(screen.getByTestId('reconnect-webcam-button'))
      
      await waitFor(() => {
        // Should have called initialize again
        expect(mockWebcamServiceInstance.initialize).toHaveBeenCalledTimes(2)
      })
    })

    it('should switch back to automatic mode when webcam reconnects successfully', async () => {
      mockWebcamServiceInstance.initialize
        .mockResolvedValueOnce({
          success: false,
          error: 'permission-denied'
        } as WebcamResult)
        .mockResolvedValueOnce({
          success: true,
          stream: new MediaStream()
        } as WebcamResult)
      
      render(<App />)
      
      // Wait for manual mode
      await waitFor(() => {
        expect(screen.getByText(/Mode: manual/i)).toBeInTheDocument()
      })
      
      // Click reconnect button
      fireEvent.click(screen.getByTestId('reconnect-webcam-button'))
      
      await waitFor(() => {
        expect(screen.getByText(/Mode: automatic/i)).toBeInTheDocument()
      })
    })

    it('should not show ManualColorPicker when in automatic mode', async () => {
      mockWebcamServiceInstance.initialize.mockResolvedValue({
        success: true,
        stream: new MediaStream()
      } as WebcamResult)
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/Mode: automatic/i)).toBeInTheDocument()
      })
      
      // ManualColorPicker should not be visible
      expect(screen.queryByTestId('manual-color-picker')).not.toBeInTheDocument()
    })

    it('should update bulb color when manual color is selected', async () => {
      mockWebcamServiceInstance.initialize.mockResolvedValue({
        success: false,
        error: 'permission-denied'
      } as WebcamResult)
      mockShellyControllerInstance.setColor.mockResolvedValue({ success: true, status: {} })
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('manual-color-picker')).toBeInTheDocument()
      })
      
      // Click a preset color button (e.g., red)
      const redPreset = screen.getByTestId('preset-red')
      fireEvent.click(redPreset)
      
      await waitFor(() => {
        expect(mockShellyControllerInstance.setColor).toHaveBeenCalledWith({
          red: 255,
          green: 0,
          blue: 0
        })
      })
    })

    it('should show mode indicator as automatic when webcam is active', async () => {
      mockWebcamServiceInstance.initialize.mockResolvedValue({
        success: true,
        stream: new MediaStream()
      } as WebcamResult)
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('mode-indicator')).toBeInTheDocument()
        expect(screen.getByTestId('mode-indicator')).toHaveTextContent(/automatic/i)
      })
    })
  })
})
