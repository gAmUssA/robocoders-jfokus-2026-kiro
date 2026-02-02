import { describe, it, expect } from 'vitest'
import type { RGB, AppConfig } from './index'

describe('Type definitions', () => {
  it('should allow valid RGB values', () => {
    const color: RGB = { red: 255, green: 128, blue: 0 }
    expect(color.red).toBe(255)
    expect(color.green).toBe(128)
    expect(color.blue).toBe(0)
  })

  it('should allow valid AppConfig', () => {
    const config: AppConfig = {
      shellyBulbIp: '192.168.1.100',
      selectedWebcamId: null,
      captureFrameRate: 10,
      colorChangeThreshold: 25.5,
      autoReconnect: true,
    }
    expect(config.shellyBulbIp).toBe('192.168.1.100')
    expect(config.captureFrameRate).toBe(10)
  })
})
