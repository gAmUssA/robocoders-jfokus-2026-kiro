// Color utility functions for RGB color manipulation and comparison

import type { RGB } from '../types'

/**
 * Calculate the Euclidean distance between two RGB colors in 3D color space.
 * 
 * The distance is calculated as: sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²)
 * 
 * @param color1 - First RGB color
 * @param color2 - Second RGB color
 * @returns The Euclidean distance between the two colors (0 to ~441)
 */
export function colorDistance(color1: RGB, color2: RGB): number {
  const rDiff = color1.red - color2.red
  const gDiff = color1.green - color2.green
  const bDiff = color1.blue - color2.blue
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

/**
 * Determine if the color change between two RGB colors is significant enough
 * to warrant an update. Uses a threshold of 10% (25.5 units) per channel.
 * 
 * A change is considered significant if ANY channel differs by more than the threshold.
 * 
 * @param oldColor - Previous RGB color
 * @param newColor - New RGB color
 * @param threshold - Minimum difference per channel to be considered significant (default: 25.5, which is 10% of 255)
 * @returns true if the color change is significant, false otherwise
 */
export function hasSignificantChange(
  oldColor: RGB, 
  newColor: RGB, 
  threshold: number = 25.5
): boolean {
  const rDiff = Math.abs(oldColor.red - newColor.red)
  const gDiff = Math.abs(oldColor.green - newColor.green)
  const bDiff = Math.abs(oldColor.blue - newColor.blue)
  
  return rDiff > threshold || gDiff > threshold || bDiff > threshold
}
