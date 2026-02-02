/**
 * SettingsPanel Component - Configuration UI for the application
 * 
 * Responsibilities:
 * - Input field for Shelly bulb IP address with validation
 * - Webcam device selector dropdown
 * - Connection test button
 * - Save/reset configuration buttons
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { useState, useCallback, useEffect } from 'react'
import type { AppConfig } from '../types'
import styles from './SettingsPanel.module.css'

export interface SettingsPanelProps {
  /** Current configuration */
  config: AppConfig
  /** Available webcam devices */
  availableDevices: MediaDeviceInfo[]
  /** Callback when configuration changes */
  onConfigChange: (config: Partial<AppConfig>) => void
  /** Callback to test Shelly bulb connection */
  onTestConnection: () => Promise<boolean>
  /** Callback to close the settings panel */
  onClose: () => void
}

// Default configuration values (same as ConfigManager)
const DEFAULT_CONFIG: AppConfig = {
  shellyBulbIp: '192.168.1.100',
  selectedWebcamId: null,
  captureFrameRate: 10,
  colorChangeThreshold: 25.5,
  autoReconnect: true
}

// Host address validation regex (supports IP, hostname, with optional port)
// Examples: 192.168.1.100, 192.168.1.100:8080, localhost, localhost:8080, my-bulb.local
// Port 80 is default if not specified
// IP octets: 0-255 without leading zeros (except 0 itself)
const IP_OCTET = '(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])'
const IPV4_PATTERN = `${IP_OCTET}\\.${IP_OCTET}\\.${IP_OCTET}\\.${IP_OCTET}`
// Hostname: must start with letter, alphanumeric with hyphens (not at start/end of each segment)
const HOSTNAME_SEGMENT = '[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?'
const HOSTNAME_PATTERN = `(?:${HOSTNAME_SEGMENT}\\.)*${HOSTNAME_SEGMENT}`
// Port: 1-65535
const PORT_PATTERN = '(?::[1-9][0-9]{0,4})?'
const HOST_ADDRESS_REGEX = new RegExp(`^(?:${IPV4_PATTERN}|${HOSTNAME_PATTERN})${PORT_PATTERN}$`)

type ConnectionTestStatus = 'idle' | 'testing' | 'success' | 'error'

export function SettingsPanel({
  config,
  availableDevices,
  onConfigChange,
  onTestConnection,
  onClose
}: SettingsPanelProps) {
  // Local state for form values
  const [ipAddress, setIpAddress] = useState(config.shellyBulbIp)
  const [selectedWebcamId, setSelectedWebcamId] = useState<string | null>(config.selectedWebcamId)
  const [ipError, setIpError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionTestStatus>('idle')
  
  // Sync with external config changes
  useEffect(() => {
    setIpAddress(config.shellyBulbIp)
    setSelectedWebcamId(config.selectedWebcamId)
  }, [config])
  
  /**
   * Validate host address format (IP or hostname with optional port)
   * Requirements: 8.2
   */
  const validateHost = useCallback((host: string): boolean => {
    return HOST_ADDRESS_REGEX.test(host)
  }, [])
  
  /**
   * Handle host address input change
   * Requirements: 8.2
   */
  const handleIpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIpAddress(value)
    
    // Validate host format
    if (value && !validateHost(value)) {
      setIpError('Invalid address format. Use IP (192.168.1.100) or hostname (localhost:8080)')
    } else {
      setIpError(null)
    }
    
    // Reset connection status when address changes
    setConnectionStatus('idle')
  }, [validateHost])
  
  /**
   * Handle webcam device selection
   * Requirements: 8.4
   */
  const handleWebcamChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedWebcamId(value === '' ? null : value)
  }, [])
  
  /**
   * Handle connection test
   * Requirements: 8.3
   */
  const handleTestConnection = useCallback(async () => {
    setConnectionStatus('testing')
    
    try {
      const isConnected = await onTestConnection()
      setConnectionStatus(isConnected ? 'success' : 'error')
    } catch (error) {
      console.error('Connection test error:', error)
      setConnectionStatus('error')
    }
  }, [onTestConnection])
  
  /**
   * Handle save configuration
   * Requirements: 8.1, 8.5
   */
  const handleSave = useCallback(() => {
    if (ipError) {
      return // Don't save if there's a validation error
    }
    
    onConfigChange({
      shellyBulbIp: ipAddress,
      selectedWebcamId
    })
  }, [ipAddress, selectedWebcamId, ipError, onConfigChange])
  
  /**
   * Handle reset to defaults
   * Requirements: 8.1
   */
  const handleReset = useCallback(() => {
    setIpAddress(DEFAULT_CONFIG.shellyBulbIp)
    setSelectedWebcamId(DEFAULT_CONFIG.selectedWebcamId)
    setIpError(null)
    setConnectionStatus('idle')
  }, [])
  
  // Determine if save button should be disabled
  const isSaveDisabled = !!ipError || !ipAddress
  
  return (
    <div className={styles.container} data-testid="settings-panel">
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
        <button
          className={styles.closeButton}
          onClick={onClose}
          data-testid="close-button"
          aria-label="Close settings"
        >
          ✕
        </button>
      </div>
      
      <div className={styles.content}>
        {/* Shelly Bulb Address - Requirements: 8.1, 8.2 */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ip-address">
            Shelly Bulb Address
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="ip-address"
              type="text"
              className={`${styles.input} ${ipError ? styles.inputError : ''}`}
              value={ipAddress}
              onChange={handleIpChange}
              placeholder="192.168.1.100 or localhost:8080"
              data-testid="ip-address-input"
              aria-describedby={ipError ? 'ip-error' : undefined}
            />
            {ipError && (
              <span
                id="ip-error"
                className={styles.errorText}
                data-testid="ip-error"
              >
                {ipError}
              </span>
            )}
          </div>
        </div>
        
        {/* Connection Test - Requirements: 8.3 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Connection Test</label>
          <div className={styles.connectionTest}>
            <button
              className={styles.testButton}
              onClick={handleTestConnection}
              disabled={!!ipError || !ipAddress || connectionStatus === 'testing'}
              data-testid="test-connection-button"
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            
            {connectionStatus === 'testing' && (
              <span className={styles.statusTesting} data-testid="connection-testing">
                🔄 Testing connection...
              </span>
            )}
            
            {connectionStatus === 'success' && (
              <span className={styles.statusSuccess} data-testid="connection-success">
                ✓ Connected successfully
              </span>
            )}
            
            {connectionStatus === 'error' && (
              <span className={styles.statusError} data-testid="connection-error">
                ✗ Connection failed
              </span>
            )}
          </div>
        </div>
        
        {/* Webcam Device Selector - Requirements: 8.4 */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="webcam-selector">
            Webcam Device
          </label>
          {availableDevices.length > 0 ? (
            <select
              id="webcam-selector"
              className={styles.select}
              value={selectedWebcamId || ''}
              onChange={handleWebcamChange}
              data-testid="webcam-selector"
            >
              <option value="">Default Camera</option>
              {availableDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          ) : (
            <div className={styles.noDevices}>
              <span className={styles.noDevicesIcon}>📷</span>
              <span>No webcams detected</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          className={styles.resetButton}
          onClick={handleReset}
          data-testid="reset-button"
        >
          Reset to Defaults
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaveDisabled}
          data-testid="save-button"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
