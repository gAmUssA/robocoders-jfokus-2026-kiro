/**
 * SettingsPanel Component Tests
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsPanel } from './SettingsPanel'
import type { AppConfig } from '../types'

describe('SettingsPanel', () => {
  const defaultConfig: AppConfig = {
    shellyBulbIp: '192.168.1.100',
    selectedWebcamId: null,
    captureFrameRate: 10,
    colorChangeThreshold: 25.5,
    autoReconnect: true
  }
  
  const mockDevices: MediaDeviceInfo[] = [
    {
      deviceId: 'device-1',
      groupId: 'group-1',
      kind: 'videoinput',
      label: 'Webcam 1',
      toJSON: () => ({})
    } as MediaDeviceInfo,
    {
      deviceId: 'device-2',
      groupId: 'group-2',
      kind: 'videoinput',
      label: 'Webcam 2',
      toJSON: () => ({})
    } as MediaDeviceInfo
  ]
  
  let mockOnConfigChange: (config: Partial<AppConfig>) => void
  let mockOnTestConnection: () => Promise<boolean>
  let mockOnClose: () => void
  
  beforeEach(() => {
    mockOnConfigChange = vi.fn()
    mockOnTestConnection = vi.fn().mockResolvedValue(true)
    mockOnClose = vi.fn()
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })
  
  describe('Rendering', () => {
    it('should render the settings panel with title', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
    
    it('should render IP address input with current value', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      expect(ipInput).toHaveValue('192.168.1.100')
    })
    
    it('should render webcam device selector', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByTestId('webcam-selector')).toBeInTheDocument()
    })
    
    it('should render test connection button', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByTestId('test-connection-button')).toBeInTheDocument()
    })
    
    it('should render save and reset buttons', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByTestId('save-button')).toBeInTheDocument()
      expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    })
  })
  
  describe('IP Address Validation - Requirements: 8.2', () => {
    it('should show valid indicator for valid IP address', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: '192.168.1.50' } })
      
      expect(screen.queryByTestId('ip-error')).not.toBeInTheDocument()
    })
    
    it('should accept hostname with port', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: 'localhost:8080' } })
      
      expect(screen.queryByTestId('ip-error')).not.toBeInTheDocument()
    })
    
    it('should accept IP address with port', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: '192.168.1.100:8080' } })
      
      expect(screen.queryByTestId('ip-error')).not.toBeInTheDocument()
    })
    
    it('should show error for invalid address format', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: '-invalid' } })
      
      expect(screen.getByTestId('ip-error')).toBeInTheDocument()
    })
    
    it('should show error for IP with values > 255', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: '256.168.1.1' } })
      
      expect(screen.getByTestId('ip-error')).toBeInTheDocument()
    })
    
    it('should disable save button when address is invalid', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: '-invalid' } })
      
      const saveButton = screen.getByTestId('save-button')
      expect(saveButton).toBeDisabled()
    })
  })
  
  describe('Connection Test Button - Requirements: 8.3', () => {
    it('should call onTestConnection when test button is clicked', async () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const testButton = screen.getByTestId('test-connection-button')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(mockOnTestConnection).toHaveBeenCalled()
      })
    })
    
    it('should show success message when connection test succeeds', async () => {
      mockOnTestConnection = vi.fn().mockResolvedValue(true)
      
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const testButton = screen.getByTestId('test-connection-button')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-success')).toBeInTheDocument()
      })
    })
    
    it('should show error message when connection test fails', async () => {
      mockOnTestConnection = vi.fn().mockResolvedValue(false)
      
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const testButton = screen.getByTestId('test-connection-button')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-error')).toBeInTheDocument()
      })
    })
    
    it('should show loading state while testing connection', async () => {
      // Create a promise that we can control
      let resolveTest: (value: boolean) => void
      mockOnTestConnection = vi.fn().mockImplementation(() => {
        return new Promise<boolean>((resolve) => {
          resolveTest = resolve
        })
      })
      
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const testButton = screen.getByTestId('test-connection-button')
      fireEvent.click(testButton)
      
      // Should show loading state
      expect(screen.getByTestId('connection-testing')).toBeInTheDocument()
      
      // Resolve the promise
      resolveTest!(true)
      
      await waitFor(() => {
        expect(screen.queryByTestId('connection-testing')).not.toBeInTheDocument()
      })
    })
  })
  
  describe('Configuration Save/Load - Requirements: 8.1, 8.5', () => {
    it('should call onConfigChange with updated IP when save is clicked', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const ipInput = screen.getByTestId('ip-address-input')
      fireEvent.change(ipInput, { target: { value: '10.0.0.1' } })
      
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ shellyBulbIp: '10.0.0.1' })
      )
    })
    
    it('should reset to defaults when reset button is clicked', () => {
      const customConfig: AppConfig = {
        ...defaultConfig,
        shellyBulbIp: '10.0.0.50'
      }
      
      render(
        <SettingsPanel
          config={customConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const resetButton = screen.getByTestId('reset-button')
      fireEvent.click(resetButton)
      
      // Should reset the IP input to default value
      const ipInput = screen.getByTestId('ip-address-input')
      expect(ipInput).toHaveValue('192.168.1.100')
    })
  })
  
  describe('Webcam Device Selection - Requirements: 8.4', () => {
    it('should display available webcam devices in dropdown', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const selector = screen.getByTestId('webcam-selector')
      expect(selector).toBeInTheDocument()
      
      // Check that device options are present
      expect(screen.getByText('Webcam 1')).toBeInTheDocument()
      expect(screen.getByText('Webcam 2')).toBeInTheDocument()
    })
    
    it('should show "Default" option when no device is selected', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Default Camera')).toBeInTheDocument()
    })
    
    it('should update selectedWebcamId when device is selected', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const selector = screen.getByTestId('webcam-selector')
      fireEvent.change(selector, { target: { value: 'device-1' } })
      
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ selectedWebcamId: 'device-1' })
      )
    })
    
    it('should show message when no webcams are available', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={[]}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('No webcams detected')).toBeInTheDocument()
    })
  })
  
  describe('Close Button', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      const closeButton = screen.getByTestId('close-button')
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
  
  describe('Accessibility', () => {
    it('should have accessible labels for inputs', () => {
      render(
        <SettingsPanel
          config={defaultConfig}
          availableDevices={mockDevices}
          onConfigChange={mockOnConfigChange}
          onTestConnection={mockOnTestConnection}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByLabelText(/shelly bulb address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/webcam/i)).toBeInTheDocument()
    })
  })
})
