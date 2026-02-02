// Color extraction service using k-means clustering algorithm

import type { RGB, ExtractionOptions } from '../types'

/**
 * ColorExtractor service for analyzing image data and extracting dominant colors.
 * Uses k-means clustering algorithm to identify the most prevalent color in an image.
 */
export class ColorExtractor {
  /**
   * Extract the dominant color from image data using k-means clustering.
   * 
   * Algorithm:
   * 1. Sample pixels from the image (every Nth pixel based on sampleRate)
   * 2. Filter out pure black (0,0,0) and pure white (255,255,255) if ignoreExtremes is true
   * 3. Run k-means clustering to find k dominant color clusters
   * 4. Return the color of the largest cluster
   * 
   * Performance: Completes in <100ms for 640x480 frames
   * 
   * @param imageData - ImageData from canvas containing pixel data
   * @param options - Extraction options (clusters, sampleRate, ignoreExtremes)
   * @returns The dominant RGB color
   */
  extractDominantColor(
    imageData: ImageData,
    options: Partial<ExtractionOptions> = {}
  ): RGB {
    const {
      ignoreExtremes = true,
      clusters = 5,
      sampleRate = 4
    } = options

    // Sample pixels from the image
    const pixels = this.samplePixels(imageData, sampleRate, ignoreExtremes)

    // Handle edge case: no valid pixels
    if (pixels.length === 0) {
      return { red: 128, green: 128, blue: 128 } // Return gray as fallback
    }

    // Handle edge case: only one pixel
    if (pixels.length === 1) {
      return pixels[0]
    }

    // Run k-means clustering
    const clusterCount = Math.min(clusters, pixels.length)
    const clusterResult = this.kMeans(pixels, clusterCount)

    // Find the largest cluster
    const largestCluster = this.findLargestCluster(clusterResult)

    return largestCluster
  }

  /**
   * Sample pixels from image data at regular intervals.
   * 
   * @param imageData - ImageData from canvas
   * @param sampleRate - Sample every Nth pixel (e.g., 4 means every 4th pixel)
   * @param ignoreExtremes - Whether to filter out pure black and pure white
   * @returns Array of sampled RGB colors
   */
  private samplePixels(
    imageData: ImageData,
    sampleRate: number,
    ignoreExtremes: boolean
  ): RGB[] {
    const pixels: RGB[] = []
    const data = imageData.data // RGBA array: [r, g, b, a, r, g, b, a, ...]
    const pixelCount = data.length / 4

    for (let i = 0; i < pixelCount; i += sampleRate) {
      const offset = i * 4
      const red = data[offset]
      const green = data[offset + 1]
      const blue = data[offset + 2]

      // Filter out pure black and pure white if requested
      if (ignoreExtremes) {
        const isPureBlack = red === 0 && green === 0 && blue === 0
        const isPureWhite = red === 255 && green === 255 && blue === 255
        if (isPureBlack || isPureWhite) {
          continue
        }
      }

      pixels.push({ red, green, blue })
    }

    return pixels
  }

  /**
   * K-means clustering algorithm to find dominant colors.
   * 
   * @param pixels - Array of RGB colors to cluster
   * @param k - Number of clusters
   * @param maxIterations - Maximum iterations for convergence (default: 10)
   * @returns Object mapping cluster centroids to their pixel arrays
   */
  private kMeans(
    pixels: RGB[],
    k: number,
    maxIterations: number = 10
  ): Map<RGB, RGB[]> {
    // Initialize centroids randomly from existing pixels
    const centroids = this.initializeCentroids(pixels, k)

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign each pixel to nearest centroid
      const clusters = new Map<RGB, RGB[]>()
      centroids.forEach(centroid => clusters.set(centroid, []))

      for (const pixel of pixels) {
        const nearestCentroid = this.findNearestCentroid(pixel, centroids)
        clusters.get(nearestCentroid)!.push(pixel)
      }

      // Update centroids to be the mean of their clusters
      let hasConverged = true
      const newCentroids: RGB[] = []

      for (const [oldCentroid, clusterPixels] of clusters.entries()) {
        if (clusterPixels.length === 0) {
          // Keep empty cluster centroid unchanged
          newCentroids.push(oldCentroid)
          continue
        }

        const newCentroid = this.calculateMean(clusterPixels)
        newCentroids.push(newCentroid)

        // Check if centroid moved significantly
        if (this.colorDistance(oldCentroid, newCentroid) > 1) {
          hasConverged = false
        }
      }

      // Update centroids for next iteration
      centroids.splice(0, centroids.length, ...newCentroids)

      // Early exit if converged
      if (hasConverged) {
        break
      }
    }

    // Build final cluster map
    const finalClusters = new Map<RGB, RGB[]>()
    centroids.forEach(centroid => finalClusters.set(centroid, []))

    for (const pixel of pixels) {
      const nearestCentroid = this.findNearestCentroid(pixel, centroids)
      finalClusters.get(nearestCentroid)!.push(pixel)
    }

    return finalClusters
  }

  /**
   * Initialize k centroids by randomly selecting from existing pixels.
   * 
   * @param pixels - Array of RGB colors
   * @param k - Number of centroids to initialize
   * @returns Array of k initial centroids
   */
  private initializeCentroids(pixels: RGB[], k: number): RGB[] {
    const centroids: RGB[] = []
    const usedIndices = new Set<number>()

    // Randomly select k unique pixels as initial centroids
    while (centroids.length < k && centroids.length < pixels.length) {
      const randomIndex = Math.floor(Math.random() * pixels.length)
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex)
        centroids.push({ ...pixels[randomIndex] })
      }
    }

    return centroids
  }

  /**
   * Find the nearest centroid to a given pixel using Euclidean distance.
   * 
   * @param pixel - RGB color to find nearest centroid for
   * @param centroids - Array of centroid RGB colors
   * @returns The nearest centroid
   */
  private findNearestCentroid(pixel: RGB, centroids: RGB[]): RGB {
    let nearestCentroid = centroids[0]
    let minDistance = this.colorDistance(pixel, nearestCentroid)

    for (let i = 1; i < centroids.length; i++) {
      const distance = this.colorDistance(pixel, centroids[i])
      if (distance < minDistance) {
        minDistance = distance
        nearestCentroid = centroids[i]
      }
    }

    return nearestCentroid
  }

  /**
   * Calculate the mean (average) color of an array of pixels.
   * 
   * @param pixels - Array of RGB colors
   * @returns The mean RGB color
   */
  private calculateMean(pixels: RGB[]): RGB {
    if (pixels.length === 0) {
      return { red: 0, green: 0, blue: 0 }
    }

    let sumRed = 0
    let sumGreen = 0
    let sumBlue = 0

    for (const pixel of pixels) {
      sumRed += pixel.red
      sumGreen += pixel.green
      sumBlue += pixel.blue
    }

    return {
      red: Math.round(sumRed / pixels.length),
      green: Math.round(sumGreen / pixels.length),
      blue: Math.round(sumBlue / pixels.length)
    }
  }

  /**
   * Calculate Euclidean distance between two RGB colors.
   * 
   * @param color1 - First RGB color
   * @param color2 - Second RGB color
   * @returns The Euclidean distance
   */
  private colorDistance(color1: RGB, color2: RGB): number {
    const rDiff = color1.red - color2.red
    const gDiff = color1.green - color2.green
    const bDiff = color1.blue - color2.blue
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
  }

  /**
   * Find the largest cluster from k-means result.
   * 
   * @param clusters - Map of centroids to their pixel arrays
   * @returns The centroid of the largest cluster
   */
  private findLargestCluster(clusters: Map<RGB, RGB[]>): RGB {
    let largestCluster: RGB = { red: 128, green: 128, blue: 128 }
    let maxSize = 0

    for (const [centroid, pixels] of clusters.entries()) {
      if (pixels.length > maxSize) {
        maxSize = pixels.length
        largestCluster = centroid
      }
    }

    return largestCluster
  }
}
