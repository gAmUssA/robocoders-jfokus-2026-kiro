/**
 * WebcamService - Manages webcam access and frame capture using MediaStream API
 * 
 * Responsibilities:
 * - Initialize webcam with getUserMedia
 * - Enumerate available video devices
 * - Capture frames at specified FPS using requestAnimationFrame
 * - Extract ImageData from video frames using off-screen canvas
 * - Provide access to video stream for display
 * - Track webcam active state
 * - Clean up resources on stopCapture
 * 
 * Requirements: 1.1, 1.2, 1.5, 8.4
 */

import type { WebcamResult, WebcamError } from '../types'

export interface WebcamService {
  /**
   * Initialize webcam with specified device ID (null for default)
   * @param deviceId - Device ID from MediaDeviceInfo, or null for default device
   * @returns Promise resolving to WebcamResult with stream or error
   */
  initialize(deviceId: string | null): Promise<WebcamResult>
  
  /**
   * Get list of available video input devices
   * @returns Promise resolving to array of MediaDeviceInfo objects
   */
  getAvailableDevices(): Promise<MediaDeviceInfo[]>
  
  /**
   * Start capturing frames at specified FPS
   * @param fps - Target frames per second (minimum 10 FPS)
   * @param onFrame - Callback invoked with ImageData for each captured frame
   */
  startCapture(fps: number, onFrame: (imageData: ImageData) => void): void
  
  /**
   * Stop capturing frames and cleanup resources
   */
  stopCapture(): void
  
  /**
   * Get current video stream for display
   * @returns MediaStream if active, null otherwise
   */
  getVideoStream(): MediaStream | null
  
  /**
   * Check if webcam is currently active
   * @returns true if webcam is active, false otherwise
   */
  isActive(): boolean
}

/**
 * Create a new WebcamService instance
 */
export function createWebcamService(): WebcamService {
  let currentStream: MediaStream | null = null
  let active = false
  let animationFrameId: number | null = null
  let canvas: HTMLCanvasElement | null = null
  let context: CanvasRenderingContext2D | null = null
  let videoElement: HTMLVideoElement | null = null
  let lastFrameTime = 0
  let frameInterval = 0
  let onFrameCallback: ((imageData: ImageData) => void) | null = null

  /**
   * Map MediaStream API errors to WebcamError types
   */
  function mapError(error: unknown): WebcamError {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          return 'permission-denied'
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          return 'device-not-found'
        case 'NotReadableError':
        case 'TrackStartError':
          return 'device-in-use'
        default:
          return 'unknown-error'
      }
    }
    return 'unknown-error'
  }

  /**
   * Capture a single frame from the video element
   */
  function captureFrame(timestamp: number): void {
    if (!onFrameCallback || !videoElement || !canvas || !context) {
      return
    }

    // Throttle to target FPS
    const elapsed = timestamp - lastFrameTime
    if (elapsed < frameInterval) {
      animationFrameId = requestAnimationFrame(captureFrame)
      return
    }

    lastFrameTime = timestamp

    // Ensure video is ready
    if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA) {
      animationFrameId = requestAnimationFrame(captureFrame)
      return
    }

    // Set canvas size to match video dimensions
    if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
    }

    // Draw video frame to canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    // Extract ImageData
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Invoke callback with ImageData
    onFrameCallback(imageData)

    // Schedule next frame
    animationFrameId = requestAnimationFrame(captureFrame)
  }

  return {
    async initialize(deviceId: string | null): Promise<WebcamResult> {
      try {
        // Release any existing stream
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop())
          currentStream = null
          active = false
        }

        // Build constraints
        const constraints: MediaStreamConstraints = {
          video: deviceId 
            ? { deviceId: { exact: deviceId } }
            : true,
          audio: false
        }

        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        
        currentStream = stream
        active = true

        return { success: true, stream }
      } catch (error) {
        active = false
        currentStream = null
        return { success: false, error: mapError(error) }
      }
    },

    async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        return devices.filter(device => device.kind === 'videoinput')
      } catch (error) {
        console.error('Failed to enumerate devices:', error)
        return []
      }
    },

    startCapture(fps: number, onFrame: (imageData: ImageData) => void): void {
      // Ensure minimum 10 FPS
      const targetFps = Math.max(fps, 10)
      frameInterval = 1000 / targetFps

      onFrameCallback = onFrame

      // Create off-screen canvas if not exists
      if (!canvas) {
        canvas = document.createElement('canvas')
        context = canvas.getContext('2d', { willReadFrequently: true })
      }

      // Create video element if not exists
      if (!videoElement) {
        videoElement = document.createElement('video')
        videoElement.autoplay = true
        videoElement.playsInline = true
      }

      // Attach stream to video element
      if (currentStream) {
        videoElement.srcObject = currentStream
      }

      // Start capture loop
      lastFrameTime = performance.now()
      animationFrameId = requestAnimationFrame(captureFrame)
    },

    stopCapture(): void {
      // Cancel animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }

      // Clear callback
      onFrameCallback = null

      // Clean up video element
      if (videoElement) {
        videoElement.srcObject = null
        videoElement = null
      }

      // Canvas can be reused, so we don't destroy it
      // but we clear the context
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    },

    getVideoStream(): MediaStream | null {
      return currentStream
    },

    isActive(): boolean {
      return active && currentStream !== null
    }
  }
}
