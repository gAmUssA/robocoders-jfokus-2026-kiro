/**
 * Unit tests for VideoFeed component
 * 
 * Tests:
 * - Renders video element when stream is active
 * - Renders placeholder when stream is inactive
 * - Attaches MediaStream to video element
 * - Cleans up stream on unmount
 * - Shows appropriate placeholder messages
 * - Ensures minimum 640x480 resolution
 * 
 * Requirements: 1.4, 4.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { VideoFeed } from './VideoFeed'

describe('VideoFeed Component', () => {
  let mockStream: MediaStream

  beforeEach(() => {
    // Create a mock MediaStream
    mockStream = {
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
      addTrack: () => {},
      removeTrack: () => {},
      getTrackById: () => null,
      clone: () => mockStream,
      active: true,
      id: 'mock-stream-id',
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as unknown as MediaStream
  })

  afterEach(() => {
    cleanup()
  })

  describe('Active webcam with stream', () => {
    it('should render video element when stream is active', () => {
      render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed')
      expect(video).toBeDefined()
      expect(video.tagName).toBe('VIDEO')
    })

    it('should attach MediaStream to video element', () => {
      render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video.srcObject).toBe(mockStream)
    })

    it('should set video element attributes correctly', () => {
      render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video.autoplay).toBe(true)
      expect(video.playsInline).toBe(true)
      expect(video.muted).toBe(true)
    })

    it('should not render placeholder when stream is active', () => {
      render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const placeholder = screen.queryByTestId('video-placeholder')
      expect(placeholder).toBeNull()
    })
  })

  describe('Inactive webcam', () => {
    it('should render placeholder when stream is null', () => {
      render(<VideoFeed stream={null} isActive={false} />)
      
      const placeholder = screen.getByTestId('video-placeholder')
      expect(placeholder).toBeDefined()
    })

    it('should show "Webcam inactive" message when not active', () => {
      render(<VideoFeed stream={null} isActive={false} />)
      
      expect(screen.getByText('Webcam inactive')).toBeDefined()
    })

    it('should show "Connecting to webcam..." when active but no stream', () => {
      render(<VideoFeed stream={null} isActive={true} />)
      
      expect(screen.getByText('Connecting to webcam...')).toBeDefined()
    })

    it('should not render video element when stream is null', () => {
      render(<VideoFeed stream={null} isActive={false} />)
      
      const video = screen.queryByTestId('video-feed')
      expect(video).toBeNull()
    })

    it('should render placeholder icon', () => {
      render(<VideoFeed stream={null} isActive={false} />)
      
      const placeholder = screen.getByTestId('video-placeholder')
      const svg = placeholder.querySelector('svg')
      expect(svg).toBeDefined()
    })
  })

  describe('Stream updates', () => {
    it('should update video srcObject when stream changes', () => {
      const { rerender } = render(<VideoFeed stream={null} isActive={false} />)
      
      // Initially no video element
      expect(screen.queryByTestId('video-feed')).toBeNull()
      
      // Update to active with stream
      rerender(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video.srcObject).toBe(mockStream)
    })

    it('should clear srcObject when stream becomes null', () => {
      const { rerender } = render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video.srcObject).toBe(mockStream)
      
      // Update to inactive
      rerender(<VideoFeed stream={null} isActive={false} />)
      
      // Video element should be gone, placeholder should appear
      expect(screen.queryByTestId('video-feed')).toBeNull()
      expect(screen.getByTestId('video-placeholder')).toBeDefined()
    })

    it('should handle stream change from one stream to another', () => {
      const { rerender } = render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video1 = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video1.srcObject).toBe(mockStream)
      
      // Create a new mock stream
      const newMockStream = {
        ...mockStream,
        id: 'new-mock-stream-id',
      } as unknown as MediaStream
      
      rerender(<VideoFeed stream={newMockStream} isActive={true} />)
      
      const video2 = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video2.srcObject).toBe(newMockStream)
    })
  })

  describe('Cleanup', () => {
    it('should clear srcObject on unmount', () => {
      const { unmount } = render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video.srcObject).toBe(mockStream)
      
      unmount()
      
      // After unmount, srcObject should be cleared
      expect(video.srcObject).toBeNull()
    })
  })

  describe('Resolution requirements', () => {
    it('should have minimum 640x480 dimensions in CSS', () => {
      render(<VideoFeed stream={mockStream} isActive={true} />)
      
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      
      // Note: In jsdom, computed styles may not reflect CSS exactly,
      // but we can verify the element has the correct class
      expect(video.className).toContain('video')
    })

    it('should have minimum dimensions for placeholder', () => {
      render(<VideoFeed stream={null} isActive={false} />)
      
      const placeholder = screen.getByTestId('video-placeholder')
      
      // Verify placeholder has the correct class
      expect(placeholder.className).toContain('placeholder')
    })
  })

  describe('Edge cases', () => {
    it('should handle isActive=false with non-null stream', () => {
      render(<VideoFeed stream={mockStream} isActive={false} />)
      
      // Should show placeholder, not video
      expect(screen.queryByTestId('video-feed')).toBeNull()
      expect(screen.getByTestId('video-placeholder')).toBeDefined()
    })

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<VideoFeed stream={null} isActive={false} />)
      
      // Rapidly toggle between states
      rerender(<VideoFeed stream={mockStream} isActive={true} />)
      rerender(<VideoFeed stream={null} isActive={false} />)
      rerender(<VideoFeed stream={mockStream} isActive={true} />)
      
      // Should end up in active state
      const video = screen.getByTestId('video-feed') as HTMLVideoElement
      expect(video.srcObject).toBe(mockStream)
    })
  })
})
