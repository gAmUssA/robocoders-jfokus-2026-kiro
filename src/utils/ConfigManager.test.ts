import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ConfigManager } from './ConfigManager'
import type { AppConfig } from '../types'

describe('ConfigManager', () => {
  let configManager: ConfigManager
  let originalLocalStorage: Storage

  beforeEach(() => {
    // Create a fresh ConfigManager instance for each test
    configManager = new ConfigManager()
    
    // Save original localStorage
    originalLocalStorage = globalThis.localStorage
    
    // Mock localStorage
    const storage: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
      clear: () => {
        Object.keys(storage).forEach(key => delete storage[key])
      },
      key: (index: number) => Object.keys(storage)[index] || null,
      length: Object.keys(storage).length
    } as Storage
  })

  afterEach(() => {
    // Restore original localStorage
    globalThis.localStorage = originalLocalStorage
  })

  describe('getConfig', () => {
    it('should return default configuration when localStorage is empty', () => {
      const config = configManager.getConfig()
      
      expect(config).toEqual({
        shellyBulbIp: '192.168.1.100',
        selectedWebcamId: null,
        captureFrameRate: 10,
        colorChangeThreshold: 25.5,
        autoReconnect: true
      })
    })

    it('should return stored configuration from localStorage', () => {
      const storedConfig: AppConfig = {
        shellyBulbIp: '192.168.1.50',
        selectedWebcamId: 'device-123',
        captureFrameRate: 15,
        colorChangeThreshold: 30,
        autoReconnect: false
      }
      
      localStorage.setItem('shelly-iot-color-picker-config', JSON.stringify(storedConfig))
      
      const config = configManager.getConfig()
      expect(config).toEqual(storedConfig)
    })

    it('should merge stored config with defaults for missing fields', () => {
      const partialConfig = {
        shellyBulbIp: '192.168.1.75'
      }
      
      localStorage.setItem('shelly-iot-color-picker-config', JSON.stringify(partialConfig))
      
      const config = configManager.getConfig()
      expect(config.shellyBulbIp).toBe('192.168.1.75')
      expect(config.selectedWebcamId).toBe(null)
      expect(config.captureFrameRate).toBe(10)
      expect(config.colorChangeThreshold).toBe(25.5)
      expect(config.autoReconnect).toBe(true)
    })

    it('should return defaults when localStorage contains invalid JSON', () => {
      localStorage.setItem('shelly-iot-color-picker-config', 'invalid-json{')
      
      const config = configManager.getConfig()
      expect(config).toEqual({
        shellyBulbIp: '192.168.1.100',
        selectedWebcamId: null,
        captureFrameRate: 10,
        colorChangeThreshold: 25.5,
        autoReconnect: true
      })
    })
  })

  describe('updateConfig', () => {
    it('should update configuration and persist to localStorage', () => {
      configManager.updateConfig({
        shellyBulbIp: '192.168.1.200'
      })
      
      const stored = localStorage.getItem('shelly-iot-color-picker-config')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.shellyBulbIp).toBe('192.168.1.200')
    })

    it('should merge partial updates with existing config', () => {
      configManager.updateConfig({
        shellyBulbIp: '192.168.1.50',
        captureFrameRate: 20
      })
      
      configManager.updateConfig({
        autoReconnect: false
      })
      
      const config = configManager.getConfig()
      expect(config.shellyBulbIp).toBe('192.168.1.50')
      expect(config.captureFrameRate).toBe(20)
      expect(config.autoReconnect).toBe(false)
    })

    it('should validate host address format', () => {
      expect(() => {
        configManager.updateConfig({
          shellyBulbIp: '-invalid'
        })
      }).toThrow('Invalid host address format')
    })

    it('should reject IP addresses with invalid octets', () => {
      expect(() => {
        configManager.updateConfig({
          shellyBulbIp: '256.1.1.1'
        })
      }).toThrow('Invalid host address format')
      
      expect(() => {
        configManager.updateConfig({
          shellyBulbIp: '192.168.1.256'
        })
      }).toThrow('Invalid host address format')
    })

    it('should validate frame rate range', () => {
      expect(() => {
        configManager.updateConfig({
          captureFrameRate: 0
        })
      }).toThrow('Frame rate must be between 1 and 60')
      
      expect(() => {
        configManager.updateConfig({
          captureFrameRate: 61
        })
      }).toThrow('Frame rate must be between 1 and 60')
    })

    it('should validate color change threshold range', () => {
      expect(() => {
        configManager.updateConfig({
          colorChangeThreshold: -1
        })
      }).toThrow('Color change threshold must be between 0 and 255')
      
      expect(() => {
        configManager.updateConfig({
          colorChangeThreshold: 256
        })
      }).toThrow('Color change threshold must be between 0 and 255')
    })

    it('should accept valid frame rate values', () => {
      expect(() => {
        configManager.updateConfig({
          captureFrameRate: 1
        })
      }).not.toThrow()
      
      expect(() => {
        configManager.updateConfig({
          captureFrameRate: 60
        })
      }).not.toThrow()
    })

    it('should accept valid color threshold values', () => {
      expect(() => {
        configManager.updateConfig({
          colorChangeThreshold: 0
        })
      }).not.toThrow()
      
      expect(() => {
        configManager.updateConfig({
          colorChangeThreshold: 255
        })
      }).not.toThrow()
    })
  })

  describe('validateHostAddress', () => {
    it('should accept valid IPv4 addresses', () => {
      expect(configManager.validateHostAddress('192.168.1.1')).toBe(true)
      expect(configManager.validateHostAddress('10.0.0.1')).toBe(true)
      expect(configManager.validateHostAddress('172.16.0.1')).toBe(true)
      expect(configManager.validateHostAddress('255.255.255.255')).toBe(true)
      expect(configManager.validateHostAddress('0.0.0.0')).toBe(true)
    })

    it('should accept hostnames', () => {
      expect(configManager.validateHostAddress('localhost')).toBe(true)
      expect(configManager.validateHostAddress('my-bulb')).toBe(true)
      expect(configManager.validateHostAddress('shelly.local')).toBe(true)
      expect(configManager.validateHostAddress('my-bulb.home.local')).toBe(true)
    })

    it('should accept addresses with ports', () => {
      expect(configManager.validateHostAddress('192.168.1.1:8080')).toBe(true)
      expect(configManager.validateHostAddress('localhost:8080')).toBe(true)
      expect(configManager.validateHostAddress('my-bulb:3000')).toBe(true)
      expect(configManager.validateHostAddress('shelly.local:80')).toBe(true)
    })

    it('should reject invalid address formats', () => {
      expect(configManager.validateHostAddress('')).toBe(false)
      expect(configManager.validateHostAddress('192.168.1')).toBe(false)
      expect(configManager.validateHostAddress('192.168.1.1.1')).toBe(false)
      expect(configManager.validateHostAddress('256.1.1.1')).toBe(false)
      expect(configManager.validateHostAddress('192.168.1.256')).toBe(false)
      expect(configManager.validateHostAddress('-invalid')).toBe(false)
      expect(configManager.validateHostAddress('invalid-')).toBe(false)
    })

    it('should reject IP addresses with leading zeros', () => {
      // Note: Some implementations may accept leading zeros, but they can be ambiguous
      // The regex should handle this appropriately
      expect(configManager.validateHostAddress('192.168.001.001')).toBe(false)
    })
  })

  describe('resetToDefaults', () => {
    it('should reset configuration to default values', () => {
      // First, set a custom configuration
      configManager.updateConfig({
        shellyBulbIp: '192.168.1.50',
        captureFrameRate: 20,
        autoReconnect: false
      })
      
      // Reset to defaults
      configManager.resetToDefaults()
      
      // Verify defaults are restored
      const config = configManager.getConfig()
      expect(config).toEqual({
        shellyBulbIp: '192.168.1.100',
        selectedWebcamId: null,
        captureFrameRate: 10,
        colorChangeThreshold: 25.5,
        autoReconnect: true
      })
    })

    it('should persist default values to localStorage', () => {
      configManager.resetToDefaults()
      
      const stored = localStorage.getItem('shelly-iot-color-picker-config')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed).toEqual({
        shellyBulbIp: '192.168.1.100',
        selectedWebcamId: null,
        captureFrameRate: 10,
        colorChangeThreshold: 25.5,
        autoReconnect: true
      })
    })
  })

  describe('localStorage integration', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const errorStorage = {
        getItem: () => {
          throw new Error('Storage error')
        },
        setItem: () => {
          throw new Error('Storage error')
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0
      } as Storage
      
      globalThis.localStorage = errorStorage
      
      // getConfig should return defaults on error
      const config = configManager.getConfig()
      expect(config).toEqual({
        shellyBulbIp: '192.168.1.100',
        selectedWebcamId: null,
        captureFrameRate: 10,
        colorChangeThreshold: 25.5,
        autoReconnect: true
      })
      
      // updateConfig should throw on error
      expect(() => {
        configManager.updateConfig({ shellyBulbIp: '192.168.1.50' })
      }).toThrow()
    })
  })

  describe('default configuration values', () => {
    it('should have sensible default values', () => {
      const config = configManager.getConfig()
      
      // IP should be a valid format
      expect(configManager.validateHostAddress(config.shellyBulbIp)).toBe(true)
      
      // Frame rate should meet minimum requirement (10 FPS)
      expect(config.captureFrameRate).toBeGreaterThanOrEqual(10)
      
      // Threshold should be 10% of 255 (25.5)
      expect(config.colorChangeThreshold).toBe(25.5)
      
      // Auto-reconnect should be enabled for reliability
      expect(config.autoReconnect).toBe(true)
      
      // No webcam selected by default
      expect(config.selectedWebcamId).toBe(null)
    })
  })
})
