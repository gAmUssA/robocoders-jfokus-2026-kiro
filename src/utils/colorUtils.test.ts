// Unit tests for color utility functions

import { describe, it, expect } from 'vitest'
import { colorDistance, hasSignificantChange } from './colorUtils'
import type { RGB } from '../types'

describe('colorDistance', () => {
  it('should return 0 for identical colors', () => {
    const color: RGB = { red: 100, green: 150, blue: 200 }
    expect(colorDistance(color, color)).toBe(0)
  })

  it('should calculate correct distance for pure red difference', () => {
    const color1: RGB = { red: 0, green: 0, blue: 0 }
    const color2: RGB = { red: 100, green: 0, blue: 0 }
    expect(colorDistance(color1, color2)).toBe(100)
  })

  it('should calculate correct distance for pure green difference', () => {
    const color1: RGB = { red: 0, green: 0, blue: 0 }
    const color2: RGB = { red: 0, green: 100, blue: 0 }
    expect(colorDistance(color1, color2)).toBe(100)
  })

  it('should calculate correct distance for pure blue difference', () => {
    const color1: RGB = { red: 0, green: 0, blue: 0 }
    const color2: RGB = { red: 0, green: 0, blue: 100 }
    expect(colorDistance(color1, color2)).toBe(100)
  })

  it('should calculate correct Euclidean distance for 3D color space', () => {
    const color1: RGB = { red: 0, green: 0, blue: 0 }
    const color2: RGB = { red: 3, green: 4, blue: 0 }
    // sqrt(3² + 4² + 0²) = sqrt(9 + 16) = sqrt(25) = 5
    expect(colorDistance(color1, color2)).toBe(5)
  })

  it('should calculate maximum distance between black and white', () => {
    const black: RGB = { red: 0, green: 0, blue: 0 }
    const white: RGB = { red: 255, green: 255, blue: 255 }
    // sqrt(255² + 255² + 255²) = sqrt(195075) ≈ 441.67
    expect(colorDistance(black, white)).toBeCloseTo(441.67, 2)
  })

  it('should be symmetric (distance A to B equals distance B to A)', () => {
    const color1: RGB = { red: 50, green: 100, blue: 150 }
    const color2: RGB = { red: 200, green: 75, blue: 25 }
    expect(colorDistance(color1, color2)).toBe(colorDistance(color2, color1))
  })

  it('should handle colors with same values in different channels', () => {
    const color1: RGB = { red: 100, green: 100, blue: 100 }
    const color2: RGB = { red: 150, green: 150, blue: 150 }
    // sqrt(50² + 50² + 50²) = sqrt(7500) ≈ 86.60
    expect(colorDistance(color1, color2)).toBeCloseTo(86.60, 2)
  })
})

describe('hasSignificantChange', () => {
  const defaultThreshold = 25.5 // 10% of 255

  it('should return false for identical colors', () => {
    const color: RGB = { red: 100, green: 150, blue: 200 }
    expect(hasSignificantChange(color, color)).toBe(false)
  })

  it('should return false when all channels differ by less than threshold', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 110, green: 160, blue: 210 }
    expect(hasSignificantChange(color1, color2)).toBe(false)
  })

  it('should return true when red channel exceeds threshold', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 130, green: 150, blue: 200 }
    expect(hasSignificantChange(color1, color2)).toBe(true)
  })

  it('should return true when green channel exceeds threshold', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 100, green: 180, blue: 200 }
    expect(hasSignificantChange(color1, color2)).toBe(true)
  })

  it('should return true when blue channel exceeds threshold', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 100, green: 150, blue: 230 }
    expect(hasSignificantChange(color1, color2)).toBe(true)
  })

  it('should return true when any channel exceeds threshold', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 105, green: 155, blue: 230 }
    expect(hasSignificantChange(color1, color2)).toBe(true)
  })

  it('should use absolute difference (works in both directions)', () => {
    const color1: RGB = { red: 200, green: 150, blue: 100 }
    const color2: RGB = { red: 170, green: 150, blue: 100 }
    expect(hasSignificantChange(color1, color2)).toBe(true)
    expect(hasSignificantChange(color2, color1)).toBe(true)
  })

  it('should return false when difference equals threshold exactly', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 125.5, green: 150, blue: 200 }
    expect(hasSignificantChange(color1, color2, defaultThreshold)).toBe(false)
  })

  it('should return true when difference is just above threshold', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 126, green: 150, blue: 200 }
    expect(hasSignificantChange(color1, color2, defaultThreshold)).toBe(true)
  })

  it('should respect custom threshold values', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 110, green: 150, blue: 200 }
    
    // With threshold of 5, difference of 10 should be significant
    expect(hasSignificantChange(color1, color2, 5)).toBe(true)
    
    // With threshold of 15, difference of 10 should not be significant
    expect(hasSignificantChange(color1, color2, 15)).toBe(false)
  })

  it('should handle boundary values (0 and 255)', () => {
    const black: RGB = { red: 0, green: 0, blue: 0 }
    const nearBlack: RGB = { red: 20, green: 0, blue: 0 }
    expect(hasSignificantChange(black, nearBlack)).toBe(false)
    
    const white: RGB = { red: 255, green: 255, blue: 255 }
    const nearWhite: RGB = { red: 230, green: 255, blue: 255 }
    expect(hasSignificantChange(white, nearWhite)).toBe(false)
  })

  it('should detect significant change from black to dark gray', () => {
    const black: RGB = { red: 0, green: 0, blue: 0 }
    const darkGray: RGB = { red: 30, green: 30, blue: 30 }
    expect(hasSignificantChange(black, darkGray)).toBe(true)
  })

  it('should detect significant change from white to light gray', () => {
    const white: RGB = { red: 255, green: 255, blue: 255 }
    const lightGray: RGB = { red: 225, green: 225, blue: 225 }
    expect(hasSignificantChange(white, lightGray)).toBe(true)
  })

  it('should handle zero threshold (any change is significant)', () => {
    const color1: RGB = { red: 100, green: 150, blue: 200 }
    const color2: RGB = { red: 101, green: 150, blue: 200 }
    expect(hasSignificantChange(color1, color2, 0)).toBe(true)
  })

  it('should handle very large threshold (no change is significant)', () => {
    const color1: RGB = { red: 0, green: 0, blue: 0 }
    const color2: RGB = { red: 100, green: 100, blue: 100 }
    expect(hasSignificantChange(color1, color2, 200)).toBe(false)
  })
})
