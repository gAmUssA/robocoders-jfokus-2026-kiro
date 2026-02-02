// Unit tests for ShellyController
// Tests HTTP client functionality, URL generation, error handling, and timeout behavior

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ShellyControllerImpl, createShellyController } from './ShellyController'
import type { RGB } from '../types'

describe('ShellyController', () => {
  let controller: ShellyControllerImpl
  const testIp = '192.168.1.100'
  
  beforeEach(() => {
    controller = new ShellyControllerImpl(testIp)
    // Mock fetch globally
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('URL Generation', () => {
    it('should generate correct Shelly Gen1 API URL format', async () => {
      const color: RGB = { red: 255, green: 128, blue: 64 }
      
      // Mock successful response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 255,
          green: 128,
          blue: 64,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)

      // Verify URL format: http://<ip>/color/0?turn=on&red=<r>&green=<g>&blue=<b>&mode=color
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`http://${testIp}/color/0?`),
        expect.any(Object)
      )
      
      const callUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(callUrl).toContain('turn=on')
      expect(callUrl).toContain('red=255')
      expect(callUrl).toContain('green=128')
      expect(callUrl).toContain('blue=64')
      expect(callUrl).toContain('mode=color')
    })

    it('should handle RGB values at boundaries (0 and 255)', async () => {
      const color: RGB = { red: 0, green: 255, blue: 0 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 0,
          green: 255,
          blue: 0,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)

      const callUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(callUrl).toContain('red=0')
      expect(callUrl).toContain('green=255')
      expect(callUrl).toContain('blue=0')
    })
  })

  describe('setColor', () => {
    it('should successfully set color and return status', async () => {
      const color: RGB = { red: 200, green: 100, blue: 50 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 200,
          green: 100,
          blue: 50,
          brightness: 90,
          source: 'http'
        })
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.status.isOn).toBe(true)
        expect(result.status.red).toBe(200)
        expect(result.status.green).toBe(100)
        expect(result.status.blue).toBe(50)
        expect(result.status.brightness).toBe(90)
        expect(result.status.source).toBe('http')
      }
    })

    it('should handle bulb offline (non-OK response)', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('bulb-offline')
      }
    })

    it('should handle timeout after 2 seconds', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      // Mock a fetch that simulates AbortError
      vi.mocked(fetch).mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      )

      const result = await controller.setColor(color)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('timeout')
      }
    })

    it('should handle network errors', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await controller.setColor(color)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('network-error')
      }
    })

    it('should handle invalid JSON response', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Invalid JSON')
        }
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('invalid-response')
      }
    })

    it('should use AbortController for timeout', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 100,
          green: 100,
          blue: 100,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)

      // Verify AbortController signal was passed
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      )
    })

    it('should handle response with gain instead of brightness', async () => {
      const color: RGB = { red: 150, green: 75, blue: 25 }
      
      // Some Shelly Gen1 devices use 'gain' instead of 'brightness'
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 150,
          green: 75,
          blue: 25,
          gain: 85, // Using gain instead of brightness
          source: 'http'
        })
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.status.brightness).toBe(85) // Should use gain as brightness
      }
    })

    it('should handle missing optional fields in response', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Minimal response with some fields missing
          ison: true
        })
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.status.isOn).toBe(true)
        expect(result.status.brightness).toBe(100) // Default value
        expect(result.status.red).toBe(0) // Default value
        expect(result.status.green).toBe(0) // Default value
        expect(result.status.blue).toBe(0) // Default value
        expect(result.status.source).toBe('unknown') // Default value
      }
    })
  })

  describe('testConnection', () => {
    it('should return true when bulb is reachable', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: false,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 0,
          source: 'init'
        })
      } as unknown as Response)

      const result = await controller.testConnection()

      expect(result).toBe(true)
    })

    it('should return false when bulb is unreachable', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await controller.testConnection()

      expect(result).toBe(false)
    })

    it('should return false on timeout', async () => {
      // Mock fetch to simulate AbortError
      vi.mocked(fetch).mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      )

      const result = await controller.testConnection()

      expect(result).toBe(false)
    })
  })

  describe('getStatus', () => {
    it('should return current bulb status', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 255,
          green: 0,
          blue: 128,
          brightness: 75,
          source: 'http'
        })
      } as unknown as Response)

      const status = await controller.getStatus()

      expect(status).not.toBeNull()
      expect(status?.isOn).toBe(true)
      expect(status?.red).toBe(255)
      expect(status?.green).toBe(0)
      expect(status?.blue).toBe(128)
      expect(status?.brightness).toBe(75)
      expect(status?.source).toBe('http')
    })

    it('should return null when bulb is unreachable', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const status = await controller.getStatus()

      expect(status).toBeNull()
    })

    it('should return null on non-OK response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as unknown as Response)

      const status = await controller.getStatus()

      expect(status).toBeNull()
    })

    it('should return null on timeout', async () => {
      // Mock fetch to simulate AbortError
      vi.mocked(fetch).mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      )

      const status = await controller.getStatus()

      expect(status).toBeNull()
    })

    it('should use correct endpoint for status', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: false,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 0,
          source: 'init'
        })
      } as unknown as Response)

      await controller.getStatus()

      expect(fetch).toHaveBeenCalledWith(
        `http://${testIp}/color/0`,
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal)
        })
      )
    })
  })

  describe('updateBulbAddress', () => {
    it('should update IP address', async () => {
      const newIp = '192.168.1.200'
      controller.updateBulbAddress(newIp)

      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 100,
          green: 100,
          blue: 100,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)

      const callUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(callUrl).toContain(newIp)
      expect(callUrl).not.toContain(testIp)
    })

    it('should affect subsequent getStatus calls', async () => {
      const newIp = '10.0.0.50'
      controller.updateBulbAddress(newIp)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: false,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 0,
          source: 'init'
        })
      } as unknown as Response)

      await controller.getStatus()

      expect(fetch).toHaveBeenCalledWith(
        `http://${newIp}/color/0`,
        expect.any(Object)
      )
    })
  })

  describe('Factory function', () => {
    it('should create a ShellyController instance', () => {
      const controller = createShellyController('192.168.1.50')
      
      expect(controller).toBeDefined()
      expect(typeof controller.setColor).toBe('function')
      expect(typeof controller.testConnection).toBe('function')
      expect(typeof controller.getStatus).toBe('function')
      expect(typeof controller.updateBulbAddress).toBe('function')
    })
  })

  describe('Edge Cases', () => {
    it('should handle pure black color (0,0,0)', async () => {
      const color: RGB = { red: 0, green: 0, blue: 0 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(true)
    })

    it('should handle pure white color (255,255,255)', async () => {
      const color: RGB = { red: 255, green: 255, blue: 255 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 255,
          green: 255,
          blue: 255,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      const result = await controller.setColor(color)

      expect(result.success).toBe(true)
    })

    it('should handle rapid consecutive calls', async () => {
      const colors: RGB[] = [
        { red: 255, green: 0, blue: 0 },
        { red: 0, green: 255, blue: 0 },
        { red: 0, green: 0, blue: 255 }
      ]

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          ison: true,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      const results = await Promise.all(colors.map(color => controller.setColor(color)))

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
      expect(fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Connection State Management', () => {
    it('should start as disconnected', () => {
      expect(controller.isConnected()).toBe(false)
    })

    it('should mark as connected after successful setColor', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 100,
          green: 100,
          blue: 100,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)

      expect(controller.isConnected()).toBe(true)
    })

    it('should mark as disconnected after failed setColor', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await controller.setColor(color)

      expect(controller.isConnected()).toBe(false)
    })

    it('should reset connection state when IP address is updated', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      // First, establish connection
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 100,
          green: 100,
          blue: 100,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)
      expect(controller.isConnected()).toBe(true)

      // Update IP address
      controller.updateBulbAddress('192.168.1.200')

      // Connection should be reset
      expect(controller.isConnected()).toBe(false)
    })
  })

  describe('Request Queuing', () => {
    it('should queue multiple requests and process them sequentially', async () => {
      const colors: RGB[] = [
        { red: 255, green: 0, blue: 0 },
        { red: 0, green: 255, blue: 0 },
        { red: 0, green: 0, blue: 255 }
      ]

      let callOrder: number[] = []
      let callCount = 0

      vi.mocked(fetch).mockImplementation(async () => {
        const currentCall = callCount++
        callOrder.push(currentCall)
        // Simulate some delay
        await new Promise(resolve => setTimeout(resolve, 10))
        return {
          ok: true,
          json: async () => ({
            ison: true,
            red: 0,
            green: 0,
            blue: 0,
            brightness: 100,
            source: 'http'
          })
        } as unknown as Response
      })

      // Fire all requests simultaneously
      const promises = colors.map(color => controller.setColor(color))
      await Promise.all(promises)

      // All requests should have been made
      expect(fetch).toHaveBeenCalledTimes(3)
      // Requests should be processed in order
      expect(callOrder).toEqual([0, 1, 2])
    })

    it('should not block on failed requests in queue', async () => {
      const colors: RGB[] = [
        { red: 255, green: 0, blue: 0 },
        { red: 0, green: 255, blue: 0 },
        { red: 0, green: 0, blue: 255 }
      ]

      // First request fails, others succeed
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ison: true,
            red: 0,
            green: 255,
            blue: 0,
            brightness: 100,
            source: 'http'
          })
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ison: true,
            red: 0,
            green: 0,
            blue: 255,
            brightness: 100,
            source: 'http'
          })
        } as unknown as Response)

      const results = await Promise.all(colors.map(color => controller.setColor(color)))

      expect(results[0].success).toBe(false)
      expect(results[1].success).toBe(true)
      expect(results[2].success).toBe(true)
    })
  })

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should not be reconnecting initially', () => {
      expect(controller.isReconnecting()).toBe(false)
    })

    it('should start reconnection after failed setColor', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await controller.setColor(color)

      expect(controller.isReconnecting()).toBe(true)
    })

    it('should attempt reconnection every 5 seconds', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      // Initial failure
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await controller.setColor(color)

      expect(controller.isReconnecting()).toBe(true)

      // Mock failed reconnection attempts
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))

      // Advance time by 5 seconds
      await vi.advanceTimersByTimeAsync(5000)
      expect(fetch).toHaveBeenCalledTimes(2) // Initial + 1st reconnect

      // Advance another 5 seconds
      await vi.advanceTimersByTimeAsync(5000)
      expect(fetch).toHaveBeenCalledTimes(3) // Initial + 2 reconnects
    })

    it('should stop reconnection after successful connection', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      // Initial failure
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await controller.setColor(color)

      expect(controller.isReconnecting()).toBe(true)

      // Mock successful reconnection
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      // Advance time to trigger reconnection
      await vi.advanceTimersByTimeAsync(5000)

      expect(controller.isReconnecting()).toBe(false)
      expect(controller.isConnected()).toBe(true)
    })

    it('should allow manual start of reconnection', () => {
      controller.startReconnection()
      expect(controller.isReconnecting()).toBe(true)
    })

    it('should allow manual stop of reconnection', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await controller.setColor(color)

      expect(controller.isReconnecting()).toBe(true)

      controller.stopReconnection()
      expect(controller.isReconnecting()).toBe(false)
    })

    it('should not start multiple reconnection timers', async () => {
      controller.startReconnection()
      controller.startReconnection()
      controller.startReconnection()

      expect(controller.isReconnecting()).toBe(true)

      // Mock successful connection
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          ison: true,
          red: 0,
          green: 0,
          blue: 0,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      // Advance time
      await vi.advanceTimersByTimeAsync(5000)

      // Should only have made one reconnection attempt
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should stop reconnection when IP address is updated', async () => {
      const color: RGB = { red: 100, green: 100, blue: 100 }
      
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await controller.setColor(color)

      expect(controller.isReconnecting()).toBe(true)

      controller.updateBulbAddress('192.168.1.200')

      expect(controller.isReconnecting()).toBe(false)
    })

    it('should stop reconnection after successful setColor', async () => {
      // Start reconnection manually
      controller.startReconnection()
      expect(controller.isReconnecting()).toBe(true)

      // Successful setColor
      const color: RGB = { red: 100, green: 100, blue: 100 }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ison: true,
          red: 100,
          green: 100,
          blue: 100,
          brightness: 100,
          source: 'http'
        })
      } as unknown as Response)

      await controller.setColor(color)

      expect(controller.isReconnecting()).toBe(false)
      expect(controller.isConnected()).toBe(true)
    })
  })
})
