import type { AppConfig } from '../types'

const STORAGE_KEY = 'shelly-iot-color-picker-config'

// Default configuration values
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

export class ConfigManager {
  /**
   * Get current configuration from localStorage or return defaults
   */
  getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return { ...DEFAULT_CONFIG }
      }

      const parsed = JSON.parse(stored) as Partial<AppConfig>
      
      // Merge with defaults to ensure all fields are present
      return {
        ...DEFAULT_CONFIG,
        ...parsed
      }
    } catch (error) {
      console.error('Failed to load configuration from localStorage:', error)
      return { ...DEFAULT_CONFIG }
    }
  }

  /**
   * Update configuration with partial values and persist to localStorage
   */
  updateConfig(config: Partial<AppConfig>): void {
    try {
      const current = this.getConfig()
      
      // Validate IP address if provided
      if (config.shellyBulbIp !== undefined) {
        if (!this.validateHostAddress(config.shellyBulbIp)) {
          throw new Error(`Invalid host address format: ${config.shellyBulbIp}`)
        }
      }

      // Validate frame rate if provided
      if (config.captureFrameRate !== undefined) {
        if (config.captureFrameRate < 1 || config.captureFrameRate > 60) {
          throw new Error(`Frame rate must be between 1 and 60, got: ${config.captureFrameRate}`)
        }
      }

      // Validate color change threshold if provided
      if (config.colorChangeThreshold !== undefined) {
        if (config.colorChangeThreshold < 0 || config.colorChangeThreshold > 255) {
          throw new Error(`Color change threshold must be between 0 and 255, got: ${config.colorChangeThreshold}`)
        }
      }

      const updated = {
        ...current,
        ...config
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to update configuration:', error)
      throw error
    }
  }

  /**
   * Validate host address format (IP or hostname with optional port)
   * Examples: 192.168.1.100, localhost:8080, my-bulb.local
   */
  validateHostAddress(host: string): boolean {
    return HOST_ADDRESS_REGEX.test(host)
  }

  /**
   * Reset configuration to default values
   */
  resetToDefaults(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG))
    } catch (error) {
      console.error('Failed to reset configuration:', error)
      throw error
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager()
