// Unit tests for ColorExtractor service

import { describe, it, expect, beforeEach } from 'vitest'
import { ColorExtractor } from './ColorExtractor'
import type { RGB } from '../types'

describe('ColorExtractor', () => {
  let extractor: ColorExtractor

  beforeEach(() => {
    extractor = new ColorExtractor()
  })

  describe('extractDominantColor', () => {
    it('should extract dominant color from uniform image', () => {
      // Create a 10x10 image with all red pixels
      const imageData = createImageData(10, 10, { red: 255, green: 0, blue: 0 })
      
      const result = extractor.extractDominantColor(imageData)
      
      expect(result.red).toBe(255)
      expect(result.green).toBe(0)
      expect(result.blue).toBe(0)
    })

    it('should extract dominant color from mixed image', () => {
      // Create image with mostly blue pixels and some red
      const imageData = createMixedImageData(
        100, 100,
        [
          { color: { red: 0, green: 0, blue: 255 }, count: 80 },
          { color: { red: 255, green: 0, blue: 0 }, count: 20 }
        ]
      )
      
      const result = extractor.extractDominantColor(imageData)
      
      // Should be close to blue since it's dominant
      expect(result.blue).toBeGreaterThan(200)
    })

    it('should filter out pure black pixels when ignoreExtremes is true', () => {
      // Create image with black and red pixels
      const imageData = createMixedImageData(
        100, 100,
        [
          { color: { red: 0, green: 0, blue: 0 }, count: 50 },
          { color: { red: 255, green: 0, blue: 0 }, count: 50 }
        ]
      )
      
      const result = extractor.extractDominantColor(imageData, { ignoreExtremes: true })
      
      // Should extract red, ignoring black
      expect(result.red).toBeGreaterThan(200)
    })

    it('should filter out pure white pixels when ignoreExtremes is true', () => {
      // Create image with white and green pixels
      const imageData = createMixedImageData(
        100, 100,
        [
          { color: { red: 255, green: 255, blue: 255 }, count: 50 },
          { color: { red: 0, green: 255, blue: 0 }, count: 50 }
        ]
      )
      
      const result = extractor.extractDominantColor(imageData, { ignoreExtremes: true })
      
      // Should extract green, ignoring white
      expect(result.green).toBeGreaterThan(200)
    })

    it('should include black and white when ignoreExtremes is false', () => {
      // Create image with only black pixels
      const imageData = createImageData(10, 10, { red: 0, green: 0, blue: 0 })
      
      const result = extractor.extractDominantColor(imageData, { ignoreExtremes: false })
      
      expect(result.red).toBe(0)
      expect(result.green).toBe(0)
      expect(result.blue).toBe(0)
    })

    it('should return gray fallback when no valid pixels after filtering', () => {
      // Create image with only black and white pixels
      const imageData = createMixedImageData(
        100, 100,
        [
          { color: { red: 0, green: 0, blue: 0 }, count: 50 },
          { color: { red: 255, green: 255, blue: 255 }, count: 50 }
        ]
      )
      
      const result = extractor.extractDominantColor(imageData, { ignoreExtremes: true })
      
      // Should return gray fallback
      expect(result.red).toBe(128)
      expect(result.green).toBe(128)
      expect(result.blue).toBe(128)
    })

    it('should handle single pixel image', () => {
      const imageData = createImageData(1, 1, { red: 100, green: 150, blue: 200 })
      
      const result = extractor.extractDominantColor(imageData)
      
      expect(result.red).toBe(100)
      expect(result.green).toBe(150)
      expect(result.blue).toBe(200)
    })

    it('should respect custom cluster count', () => {
      const imageData = createImageData(100, 100, { red: 128, green: 128, blue: 128 })
      
      // Should not throw with different cluster counts
      expect(() => {
        extractor.extractDominantColor(imageData, { clusters: 3 })
      }).not.toThrow()
      
      expect(() => {
        extractor.extractDominantColor(imageData, { clusters: 10 })
      }).not.toThrow()
    })

    it('should respect custom sample rate', () => {
      const imageData = createImageData(100, 100, { red: 255, green: 0, blue: 0 })
      
      // Should work with different sample rates
      const result1 = extractor.extractDominantColor(imageData, { sampleRate: 1 })
      const result2 = extractor.extractDominantColor(imageData, { sampleRate: 10 })
      
      // Both should extract red
      expect(result1.red).toBeGreaterThan(200)
      expect(result2.red).toBeGreaterThan(200)
    })

    it('should complete extraction in reasonable time for 640x480 frame', () => {
      // Create a 640x480 image (typical webcam resolution)
      const imageData = createImageData(640, 480, { red: 128, green: 128, blue: 128 })
      
      const startTime = performance.now()
      extractor.extractDominantColor(imageData)
      const endTime = performance.now()
      
      const duration = endTime - startTime
      
      // Should complete in less than 100ms (requirement 2.1)
      expect(duration).toBeLessThan(100)
    })

    it('should handle image with multiple distinct colors', () => {
      // Create image with 3 distinct color regions
      const imageData = createMixedImageData(
        150, 150,
        [
          { color: { red: 255, green: 0, blue: 0 }, count: 50 },
          { color: { red: 0, green: 255, blue: 0 }, count: 30 },
          { color: { red: 0, green: 0, blue: 255 }, count: 20 }
        ]
      )
      
      const result = extractor.extractDominantColor(imageData, { clusters: 3 })
      
      // Should extract red as it's most prevalent
      expect(result.red).toBeGreaterThan(200)
    })

    it('should return valid RGB values in range 0-255', () => {
      const imageData = createImageData(100, 100, { red: 123, green: 234, blue: 45 })
      
      const result = extractor.extractDominantColor(imageData)
      
      expect(result.red).toBeGreaterThanOrEqual(0)
      expect(result.red).toBeLessThanOrEqual(255)
      expect(result.green).toBeGreaterThanOrEqual(0)
      expect(result.green).toBeLessThanOrEqual(255)
      expect(result.blue).toBeGreaterThanOrEqual(0)
      expect(result.blue).toBeLessThanOrEqual(255)
    })

    it('should handle grayscale image', () => {
      // Create grayscale image (equal RGB values)
      const imageData = createImageData(50, 50, { red: 100, green: 100, blue: 100 })
      
      const result = extractor.extractDominantColor(imageData)
      
      // Should extract approximately the same gray
      expect(Math.abs(result.red - 100)).toBeLessThan(10)
      expect(Math.abs(result.green - 100)).toBeLessThan(10)
      expect(Math.abs(result.blue - 100)).toBeLessThan(10)
    })
  })
})

// Helper functions for creating test image data

/**
 * Create ImageData with uniform color (without Canvas API)
 */
function createImageData(width: number, height: number, color: RGB): ImageData {
  const totalPixels = width * height
  const data = new Uint8ClampedArray(totalPixels * 4)
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color.red
    data[i + 1] = color.green
    data[i + 2] = color.blue
    data[i + 3] = 255 // Alpha
  }
  
  return {
    data,
    width,
    height,
    colorSpace: 'srgb'
  } as ImageData
}

/**
 * Create ImageData with mixed colors based on percentages (without Canvas API)
 */
function createMixedImageData(
  width: number,
  height: number,
  colorDistribution: Array<{ color: RGB; count: number }>
): ImageData {
  const totalPixels = width * height
  const data = new Uint8ClampedArray(totalPixels * 4)
  
  let pixelIndex = 0
  
  for (const { color, count } of colorDistribution) {
    const pixelCount = Math.floor((count / 100) * totalPixels)
    
    for (let i = 0; i < pixelCount && pixelIndex < totalPixels; i++) {
      const offset = pixelIndex * 4
      data[offset] = color.red
      data[offset + 1] = color.green
      data[offset + 2] = color.blue
      data[offset + 3] = 255 // Alpha
      pixelIndex++
    }
  }
  
  // Fill remaining pixels with last color if any
  if (pixelIndex < totalPixels && colorDistribution.length > 0) {
    const lastColor = colorDistribution[colorDistribution.length - 1].color
    for (let i = pixelIndex; i < totalPixels; i++) {
      const offset = i * 4
      data[offset] = lastColor.red
      data[offset + 1] = lastColor.green
      data[offset + 2] = lastColor.blue
      data[offset + 3] = 255
    }
  }
  
  return {
    data,
    width,
    height,
    colorSpace: 'srgb'
  } as ImageData
}
