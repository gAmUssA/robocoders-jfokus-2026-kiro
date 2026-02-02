// ShellyController: Communicates with Shelly Gen1 bulb via HTTP API
// Implements color control, connection testing, and status retrieval

import type { RGB, ShellyResult, ShellyStatus } from '../types'

export interface ShellyController {
  // Set bulb color with RGB values
  setColor(color: RGB): Promise<ShellyResult>
  
  // Test connection to bulb
  testConnection(): Promise<boolean>
  
  // Get current bulb status
  getStatus(): Promise<ShellyStatus | null>
  
  // Update bulb IP address
  updateBulbAddress(ipAddress: string): void
  
  // Get connection state
  isConnected(): boolean
  
  // Get reconnection state
  isReconnecting(): boolean
  
  // Start automatic reconnection attempts
  startReconnection(): void
  
  // Stop automatic reconnection attempts
  stopReconnection(): void
}

export class ShellyControllerImpl implements ShellyController {
  private ipAddress: string
  private readonly timeout: number = 2000 // 2 seconds as per requirements
  private connected: boolean = false
  private reconnecting: boolean = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private readonly reconnectInterval: number = 5000 // 5 seconds as per requirement 3.4
  private requestQueue: Array<() => Promise<void>> = []
  private processingQueue: boolean = false

  constructor(ipAddress: string) {
    this.ipAddress = ipAddress
  }

  /**
   * Generate Shelly Gen1 API URL for color control
   * Format: http://<ip>/color/0?turn=on&red=<r>&green=<g>&blue=<b>
   */
  private generateColorUrl(color: RGB): string {
    const params = new URLSearchParams({
      turn: 'on',
      red: color.red.toString(),
      green: color.green.toString(),
      blue: color.blue.toString(),
      mode: 'color' // Ensure we're in color mode for Gen1 RGBW bulbs
    })
    
    return `http://${this.ipAddress}/color/0?${params.toString()}`
  }

  /**
   * Set bulb color with RGB values
   * Uses Fetch API with 2-second timeout via AbortController
   * Queues requests to prevent flooding
   * Requirements: 3.1, 3.2, 3.5, 3.6
   */
  async setColor(color: RGB): Promise<ShellyResult> {
    // Queue the request to prevent flooding
    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        const result = await this.executeSetColor(color)
        
        // Update connection state based on result
        if (result.success) {
          this.connected = true
          this.stopReconnection() // Stop reconnection if successful
        } else {
          this.connected = false
          // Start reconnection if not already reconnecting
          if (!this.reconnecting) {
            this.startReconnection()
          }
        }
        
        resolve(result)
      })
      
      // Process queue if not already processing
      if (!this.processingQueue) {
        this.processQueue()
      }
    })
  }

  /**
   * Process queued requests one at a time
   * Prevents flooding the bulb with simultaneous requests
   * Requirements: 6.5
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return
    }

    this.processingQueue = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        await request()
      }
    }

    this.processingQueue = false
  }

  /**
   * Execute the actual color setting request
   * Separated from setColor for queue management
   * Requirements: 3.1, 3.2, 3.5, 3.6
   */
  private async executeSetColor(color: RGB): Promise<ShellyResult> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = this.generateColorUrl(color)
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return {
          success: false,
          error: 'bulb-offline'
        }
      }

      const data = await response.json()
      
      // Parse Shelly Gen1 response format
      // Response includes: ison, red, green, blue, brightness, source, etc.
      const status: ShellyStatus = {
        isOn: data.ison ?? false,
        brightness: data.brightness ?? data.gain ?? 100,
        red: data.red ?? 0,
        green: data.green ?? 0,
        blue: data.blue ?? 0,
        source: data.source ?? 'unknown'
      }

      return {
        success: true,
        status
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Determine error type
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'timeout'
          }
        }
        
        // Network errors (CORS, DNS, connection refused, etc.)
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          return {
            success: false,
            error: 'network-error'
          }
        }
      }

      // Invalid JSON or unexpected response format
      return {
        success: false,
        error: 'invalid-response'
      }
    }
  }

  /**
   * Test connection to bulb by attempting to get status
   * Returns true if bulb is reachable, false otherwise
   * Requirements: 3.1
   */
  async testConnection(): Promise<boolean> {
    const status = await this.getStatus()
    return status !== null
  }

  /**
   * Get current bulb status
   * Returns null if bulb is unreachable or returns invalid data
   * Requirements: 3.1
   */
  async getStatus(): Promise<ShellyStatus | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `http://${this.ipAddress}/color/0`
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      // Parse Shelly Gen1 response format
      const status: ShellyStatus = {
        isOn: data.ison ?? false,
        brightness: data.brightness ?? data.gain ?? 100,
        red: data.red ?? 0,
        green: data.green ?? 0,
        blue: data.blue ?? 0,
        source: data.source ?? 'unknown'
      }

      return status
    } catch (error) {
      clearTimeout(timeoutId)
      return null
    }
  }

  /**
   * Update bulb IP address
   * Requirements: 8.2
   */
  updateBulbAddress(ipAddress: string): void {
    this.ipAddress = ipAddress
    // Reset connection state when IP changes
    this.connected = false
    this.stopReconnection()
  }

  /**
   * Get connection state
   * Requirements: 3.3, 6.2
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * Get reconnection state
   * Requirements: 3.4
   */
  isReconnecting(): boolean {
    return this.reconnecting
  }

  /**
   * Start automatic reconnection attempts
   * Attempts to reconnect every 5 seconds
   * Requirements: 3.4
   */
  startReconnection(): void {
    if (this.reconnecting) {
      return // Already reconnecting
    }

    this.reconnecting = true
    this.scheduleReconnect()
  }

  /**
   * Schedule next reconnection attempt
   * Requirements: 3.4
   */
  private scheduleReconnect(): void {
    if (!this.reconnecting) {
      return
    }

    this.reconnectTimer = setTimeout(async () => {
      if (!this.reconnecting) {
        return
      }

      // Attempt to reconnect by testing connection
      const isConnected = await this.testConnection()
      
      if (isConnected) {
        this.connected = true
        this.stopReconnection()
      } else {
        // Schedule next attempt
        this.scheduleReconnect()
      }
    }, this.reconnectInterval)
  }

  /**
   * Stop automatic reconnection attempts
   * Requirements: 3.4
   */
  stopReconnection(): void {
    this.reconnecting = false
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/**
 * Factory function to create a ShellyController instance
 */
export function createShellyController(ipAddress: string): ShellyController {
  return new ShellyControllerImpl(ipAddress)
}
