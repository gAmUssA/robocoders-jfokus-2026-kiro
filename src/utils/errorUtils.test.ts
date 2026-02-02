import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatWebcamError, formatShellyError, logError } from './errorUtils'
import type { WebcamError, ShellyError } from '../types'

describe('errorUtils', () => {
  describe('formatWebcamError', () => {
    it('should format permission-denied error', () => {
      const result = formatWebcamError('permission-denied')
      expect(result).toBe('Camera access was denied. Please allow camera permissions in your browser settings.')
    })

    it('should format device-not-found error', () => {
      const result = formatWebcamError('device-not-found')
      expect(result).toBe('No camera found. Please connect a webcam and try again.')
    })

    it('should format device-in-use error', () => {
      const result = formatWebcamError('device-in-use')
      expect(result).toBe('Camera is in use by another application. Please close other apps using the camera.')
    })

    it('should format unknown-error', () => {
      const result = formatWebcamError('unknown-error')
      expect(result).toBe('An unexpected camera error occurred. Please try again.')
    })

    it('should return user-friendly messages (not technical)', () => {
      const errors: WebcamError[] = ['permission-denied', 'device-not-found', 'device-in-use', 'unknown-error']
      
      for (const error of errors) {
        const message = formatWebcamError(error)
        // Messages should not contain technical terms
        expect(message).not.toContain('MediaStream')
        expect(message).not.toContain('getUserMedia')
        expect(message).not.toContain('NotAllowedError')
        expect(message).not.toContain('NotFoundError')
        // Messages should be user-friendly
        expect(message.length).toBeGreaterThan(10)
        expect(message).toMatch(/[A-Z]/) // Should have proper capitalization
      }
    })
  })

  describe('formatShellyError', () => {
    it('should format network-error', () => {
      const result = formatShellyError('network-error')
      expect(result).toBe('Unable to connect to the bulb. Please check your network connection.')
    })

    it('should format timeout error', () => {
      const result = formatShellyError('timeout')
      expect(result).toBe('Connection timed out. The bulb may be offline or unreachable.')
    })

    it('should format invalid-response error', () => {
      const result = formatShellyError('invalid-response')
      expect(result).toBe('Received an unexpected response from the bulb. Please check the bulb configuration.')
    })

    it('should format bulb-offline error', () => {
      const result = formatShellyError('bulb-offline')
      expect(result).toBe('The bulb appears to be offline. Please check if it is powered on.')
    })

    it('should return user-friendly messages (not technical)', () => {
      const errors: ShellyError[] = ['network-error', 'timeout', 'invalid-response', 'bulb-offline']
      
      for (const error of errors) {
        const message = formatShellyError(error)
        // Messages should not contain technical terms
        expect(message).not.toContain('HTTP')
        expect(message).not.toContain('fetch')
        expect(message).not.toContain('AbortController')
        expect(message).not.toContain('JSON')
        // Messages should be user-friendly
        expect(message.length).toBeGreaterThan(10)
        expect(message).toMatch(/[A-Z]/) // Should have proper capitalization
      }
    })
  })

  describe('logError', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should log error with context to console', () => {
      const error = new Error('Test error')
      logError('WebcamService', error)
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[WebcamService]', error)
    })

    it('should log string errors', () => {
      logError('ShellyController', 'Connection failed')
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ShellyController]', 'Connection failed')
    })

    it('should log unknown error types', () => {
      const unknownError = { code: 123, message: 'Unknown' }
      logError('ColorExtractor', unknownError)
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ColorExtractor]', unknownError)
    })

    it('should handle null and undefined errors', () => {
      logError('TestContext', null)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext]', null)
      
      logError('TestContext', undefined)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext]', undefined)
    })
  })
})
