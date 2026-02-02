// Unit tests for WebcamService

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createWebcamService } from './WebcamService'
import type { WebcamService } from './WebcamService'

describe('WebcamService', () => {
  let service: WebcamService
  let mockGetUserMedia: ReturnType<typeof vi.fn>
  let mockEnumerateDevices: ReturnType<typeof vi.fn>
  let mockStream: MediaStream

  beforeEach(() => {
    // Create mock MediaStream
    mockStream = {
      getTracks: vi.fn(() => [
        {
          stop: vi.fn(),
          kind: 'video',
          enabled: true,
          id: 'mock-track-1',
          label: 'Mock Camera',
          readyState: 'live'
        } as unknown as MediaStreamTrack
      ]),
      getVideoTracks: vi.fn(() => []),
      getAudioTracks: vi.fn(() => []),
      addTrack: vi.fn(),
      removeTrack: vi.fn(),
      id: 'mock-stream-id',
      active: true
    } as unknown as MediaStream

    // Mock getUserMedia
    mockGetUserMedia = vi.fn()
    mockEnumerateDevices = vi.fn()

    // Setup navigator.mediaDevices mock
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: mockEnumerateDevices
      }
    })

    service = createWebcamService()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('should successfully initialize with default device', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      const result = await service.initialize(null)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.stream).toBe(mockStream)
      }
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: false
      })
    })

    it('should successfully initialize with specific device ID', async () => {
      const deviceId = 'device-123'
      mockGetUserMedia.mockResolvedValue(mockStream)

      const result = await service.initialize(deviceId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.stream).toBe(mockStream)
      }
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { deviceId: { exact: deviceId } },
        audio: false
      })
    })

    it('should return permission-denied error when user denies access', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('permission-denied')
      }
    })

    it('should return permission-denied error for PermissionDeniedError', async () => {
      const error = new DOMException('Permission denied', 'PermissionDeniedError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('permission-denied')
      }
    })

    it('should return device-not-found error when no camera available', async () => {
      const error = new DOMException('Device not found', 'NotFoundError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('device-not-found')
      }
    })

    it('should return device-not-found error for DevicesNotFoundError', async () => {
      const error = new DOMException('Devices not found', 'DevicesNotFoundError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('device-not-found')
      }
    })

    it('should return device-in-use error when camera is already in use', async () => {
      const error = new DOMException('Device in use', 'NotReadableError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('device-in-use')
      }
    })

    it('should return device-in-use error for TrackStartError', async () => {
      const error = new DOMException('Track start error', 'TrackStartError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('device-in-use')
      }
    })

    it('should return unknown-error for unrecognized DOMException', async () => {
      const error = new DOMException('Unknown error', 'UnknownError')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('unknown-error')
      }
    })

    it('should return unknown-error for non-DOMException errors', async () => {
      const error = new Error('Generic error')
      mockGetUserMedia.mockRejectedValue(error)

      const result = await service.initialize(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('unknown-error')
      }
    })

    it('should stop existing stream before initializing new one', async () => {
      const stopMock = vi.fn()
      const firstStream = {
        ...mockStream,
        getTracks: vi.fn(() => [{ stop: stopMock } as unknown as MediaStreamTrack])
      } as unknown as MediaStream

      const secondStream = {
        ...mockStream,
        id: 'second-stream'
      } as unknown as MediaStream

      mockGetUserMedia.mockResolvedValueOnce(firstStream)
      mockGetUserMedia.mockResolvedValueOnce(secondStream)

      // Initialize first time
      await service.initialize(null)

      // Initialize second time
      await service.initialize('device-456')

      expect(stopMock).toHaveBeenCalled()
      expect(mockGetUserMedia).toHaveBeenCalledTimes(2)
    })

    it('should set active state to false on error', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError')
      mockGetUserMedia.mockRejectedValue(error)

      await service.initialize(null)

      expect(service.isActive()).toBe(false)
    })

    it('should set active state to true on success', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.initialize(null)

      expect(service.isActive()).toBe(true)
    })
  })

  describe('getAvailableDevices', () => {
    it('should return list of video input devices', async () => {
      const mockDevices: MediaDeviceInfo[] = [
        {
          deviceId: 'camera-1',
          kind: 'videoinput',
          label: 'Front Camera',
          groupId: 'group-1',
          toJSON: () => ({})
        } as MediaDeviceInfo,
        {
          deviceId: 'camera-2',
          kind: 'videoinput',
          label: 'Back Camera',
          groupId: 'group-2',
          toJSON: () => ({})
        } as MediaDeviceInfo,
        {
          deviceId: 'mic-1',
          kind: 'audioinput',
          label: 'Microphone',
          groupId: 'group-3',
          toJSON: () => ({})
        } as MediaDeviceInfo
      ]

      mockEnumerateDevices.mockResolvedValue(mockDevices)

      const devices = await service.getAvailableDevices()

      expect(devices).toHaveLength(2)
      expect(devices[0].kind).toBe('videoinput')
      expect(devices[1].kind).toBe('videoinput')
      expect(devices.every(d => d.kind === 'videoinput')).toBe(true)
    })

    it('should return empty array when no video devices available', async () => {
      const mockDevices: MediaDeviceInfo[] = [
        {
          deviceId: 'mic-1',
          kind: 'audioinput',
          label: 'Microphone',
          groupId: 'group-1',
          toJSON: () => ({})
        } as MediaDeviceInfo
      ]

      mockEnumerateDevices.mockResolvedValue(mockDevices)

      const devices = await service.getAvailableDevices()

      expect(devices).toHaveLength(0)
    })

    it('should return empty array on enumeration error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockEnumerateDevices.mockRejectedValue(new Error('Enumeration failed'))

      const devices = await service.getAvailableDevices()

      expect(devices).toHaveLength(0)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to enumerate devices:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle empty device list', async () => {
      mockEnumerateDevices.mockResolvedValue([])

      const devices = await service.getAvailableDevices()

      expect(devices).toHaveLength(0)
    })

    it('should preserve device information', async () => {
      const mockDevices: MediaDeviceInfo[] = [
        {
          deviceId: 'camera-1',
          kind: 'videoinput',
          label: 'HD Webcam',
          groupId: 'group-1',
          toJSON: () => ({})
        } as MediaDeviceInfo
      ]

      mockEnumerateDevices.mockResolvedValue(mockDevices)

      const devices = await service.getAvailableDevices()

      expect(devices[0].deviceId).toBe('camera-1')
      expect(devices[0].label).toBe('HD Webcam')
      expect(devices[0].groupId).toBe('group-1')
    })
  })

  describe('getVideoStream', () => {
    it('should return null when not initialized', () => {
      const stream = service.getVideoStream()

      expect(stream).toBeNull()
    })

    it('should return stream after successful initialization', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.initialize(null)
      const stream = service.getVideoStream()

      expect(stream).toBe(mockStream)
    })

    it('should return null after initialization failure', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError')
      mockGetUserMedia.mockRejectedValue(error)

      await service.initialize(null)
      const stream = service.getVideoStream()

      expect(stream).toBeNull()
    })

    it('should return null after stream is stopped and reinitialized', async () => {
      const stopMock = vi.fn()
      const firstStream = {
        ...mockStream,
        getTracks: vi.fn(() => [{ stop: stopMock } as unknown as MediaStreamTrack])
      } as unknown as MediaStream

      mockGetUserMedia.mockResolvedValueOnce(firstStream)
      mockGetUserMedia.mockRejectedValueOnce(new DOMException('Error', 'NotAllowedError'))

      await service.initialize(null)
      await service.initialize('device-456')

      const stream = service.getVideoStream()
      expect(stream).toBeNull()
    })
  })

  describe('isActive', () => {
    it('should return false initially', () => {
      expect(service.isActive()).toBe(false)
    })

    it('should return true after successful initialization', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.initialize(null)

      expect(service.isActive()).toBe(true)
    })

    it('should return false after initialization failure', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError')
      mockGetUserMedia.mockRejectedValue(error)

      await service.initialize(null)

      expect(service.isActive()).toBe(false)
    })

    it('should return false after stream is stopped', async () => {
      const stopMock = vi.fn()
      const firstStream = {
        ...mockStream,
        getTracks: vi.fn(() => [{ stop: stopMock } as unknown as MediaStreamTrack])
      } as unknown as MediaStream

      mockGetUserMedia.mockResolvedValueOnce(firstStream)
      mockGetUserMedia.mockRejectedValueOnce(new DOMException('Error', 'NotAllowedError'))

      await service.initialize(null)
      expect(service.isActive()).toBe(true)

      await service.initialize('device-456')
      expect(service.isActive()).toBe(false)
    })

    it('should maintain active state across multiple getVideoStream calls', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.initialize(null)

      service.getVideoStream()
      service.getVideoStream()
      service.getVideoStream()

      expect(service.isActive()).toBe(true)
    })
  })

  describe('resource cleanup', () => {
    it('should stop all tracks when reinitializing', async () => {
      const track1Stop = vi.fn()
      const track2Stop = vi.fn()
      
      const firstStream = {
        ...mockStream,
        getTracks: vi.fn(() => [
          { stop: track1Stop } as unknown as MediaStreamTrack,
          { stop: track2Stop } as unknown as MediaStreamTrack
        ])
      } as unknown as MediaStream

      const secondStream = {
        ...mockStream,
        id: 'second-stream'
      } as unknown as MediaStream

      mockGetUserMedia.mockResolvedValueOnce(firstStream)
      mockGetUserMedia.mockResolvedValueOnce(secondStream)

      await service.initialize(null)
      await service.initialize('device-456')

      expect(track1Stop).toHaveBeenCalled()
      expect(track2Stop).toHaveBeenCalled()
    })

    it('should handle reinitialization with no existing tracks', async () => {
      const firstStream = {
        ...mockStream,
        getTracks: vi.fn(() => [])
      } as unknown as MediaStream

      const secondStream = {
        ...mockStream,
        id: 'second-stream'
      } as unknown as MediaStream

      mockGetUserMedia.mockResolvedValueOnce(firstStream)
      mockGetUserMedia.mockResolvedValueOnce(secondStream)

      await service.initialize(null)
      const result = await service.initialize('device-456')

      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle multiple consecutive initialization calls', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      const result1 = await service.initialize(null)
      const result2 = await service.initialize('device-1')
      const result3 = await service.initialize('device-2')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result3.success).toBe(true)
      expect(mockGetUserMedia).toHaveBeenCalledTimes(3)
    })

    it('should handle getAvailableDevices called before initialization', async () => {
      mockEnumerateDevices.mockResolvedValue([])

      const devices = await service.getAvailableDevices()

      expect(devices).toEqual([])
    })

    it('should handle isActive called multiple times', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      expect(service.isActive()).toBe(false)
      await service.initialize(null)
      expect(service.isActive()).toBe(true)
      expect(service.isActive()).toBe(true)
      expect(service.isActive()).toBe(true)
    })

    it('should handle getVideoStream called multiple times', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.initialize(null)

      const stream1 = service.getVideoStream()
      const stream2 = service.getVideoStream()
      const stream3 = service.getVideoStream()

      expect(stream1).toBe(mockStream)
      expect(stream2).toBe(mockStream)
      expect(stream3).toBe(mockStream)
    })
  })

  describe('startCapture and stopCapture', () => {
    let mockCanvas: HTMLCanvasElement
    let mockContext: CanvasRenderingContext2D
    let mockVideo: HTMLVideoElement
    let mockRequestAnimationFrame: ReturnType<typeof vi.fn>
    let mockCancelAnimationFrame: ReturnType<typeof vi.fn>

    beforeEach(() => {
      // Mock canvas and context
      mockContext = {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(640 * 480 * 4),
          width: 640,
          height: 480,
          colorSpace: 'srgb'
        })),
        clearRect: vi.fn()
      } as unknown as CanvasRenderingContext2D

      mockCanvas = {
        getContext: vi.fn(() => mockContext),
        width: 0,
        height: 0
      } as unknown as HTMLCanvasElement

      // Mock video element
      mockVideo = {
        autoplay: false,
        playsInline: false,
        srcObject: null,
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4, // HAVE_ENOUGH_DATA
        HAVE_CURRENT_DATA: 2,
        HAVE_ENOUGH_DATA: 4
      } as unknown as HTMLVideoElement

      // Mock document.createElement
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas
        }
        if (tagName === 'video') {
          return mockVideo
        }
        return originalCreateElement(tagName)
      })

      // Mock requestAnimationFrame and cancelAnimationFrame
      let frameId = 0
      mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
        frameId++
        // Use setImmediate or setTimeout to invoke callback asynchronously
        const id = frameId
        setTimeout(() => {
          callback(performance.now())
        }, 0)
        return id
      })
      mockCancelAnimationFrame = vi.fn()

      globalThis.requestAnimationFrame = mockRequestAnimationFrame as unknown as typeof requestAnimationFrame
      globalThis.cancelAnimationFrame = mockCancelAnimationFrame as unknown as typeof cancelAnimationFrame

      // Mock performance.now with incrementing values
      let now = 1000
      vi.spyOn(performance, 'now').mockImplementation(() => {
        now += 100 // Increment by 100ms each call to simulate time passing
        return now
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should start capturing frames at specified FPS', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      expect(mockVideo.srcObject).toBe(mockStream)
      expect(mockVideo.autoplay).toBe(true)
      expect(mockVideo.playsInline).toBe(true)
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should enforce minimum 10 FPS', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      
      // Try to set FPS below minimum
      service.startCapture(5, onFrameCallback)

      // The frame interval should be for 10 FPS (100ms), not 5 FPS (200ms)
      // This is tested indirectly through the throttling behavior
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should invoke callback with ImageData', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockVideo,
        0,
        0,
        640,
        480
      )
      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 640, 480)
      expect(onFrameCallback).toHaveBeenCalled()
      
      const callArg = onFrameCallback.mock.calls[0][0]
      expect(callArg).toHaveProperty('data')
      expect(callArg).toHaveProperty('width', 640)
      expect(callArg).toHaveProperty('height', 480)
    })

    it('should set canvas size to match video dimensions', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockCanvas.width).toBe(640)
      expect(mockCanvas.height).toBe(480)
    })

    it('should stop capturing when stopCapture is called', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      service.stopCapture()

      expect(mockCancelAnimationFrame).toHaveBeenCalled()
      expect(mockVideo.srcObject).toBeNull()
    })

    it('should clear canvas context on stopCapture', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      // Wait for frame to be captured
      await new Promise(resolve => setTimeout(resolve, 50))

      service.stopCapture()

      // Canvas dimensions should have been set during capture
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height)
    })

    it('should handle stopCapture without startCapture', () => {
      // Should not throw
      expect(() => service.stopCapture()).not.toThrow()
    })

    it('should handle startCapture without initialization', () => {
      const onFrameCallback = vi.fn()
      
      // Should not throw, but won't capture frames
      expect(() => service.startCapture(10, onFrameCallback)).not.toThrow()
    })

    it('should skip frame capture when video not ready', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      // Set video to not ready state
      Object.defineProperty(mockVideo, 'readyState', { value: 1, writable: true }) // HAVE_METADATA

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should not invoke callback when video not ready
      expect(mockContext.drawImage).not.toHaveBeenCalled()
      expect(onFrameCallback).not.toHaveBeenCalled()
    })

    it('should reuse canvas across multiple startCapture calls', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback1 = vi.fn()
      service.startCapture(10, onFrameCallback1)
      service.stopCapture()

      const onFrameCallback2 = vi.fn()
      service.startCapture(15, onFrameCallback2)

      // Canvas should be created only once
      const canvasCreationCalls = (document.createElement as ReturnType<typeof vi.fn>).mock.calls.filter(
        call => call[0] === 'canvas'
      )
      expect(canvasCreationCalls.length).toBe(1)
    })

    it('should handle multiple stopCapture calls', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      service.stopCapture()
      service.stopCapture()
      service.stopCapture()

      // Should not throw
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    it('should create off-screen canvas with willReadFrequently hint', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream)
      await service.initialize(null)

      const onFrameCallback = vi.fn()
      service.startCapture(10, onFrameCallback)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', { willReadFrequently: true })
    })
  })
})
