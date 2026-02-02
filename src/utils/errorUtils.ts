import type { WebcamError, ShellyError } from '../types'

/**
 * User-friendly error messages for webcam errors.
 * These messages are suitable for audience viewing during demos.
 */
const WEBCAM_ERROR_MESSAGES: Record<WebcamError, string> = {
  'permission-denied': 'Camera access was denied. Please allow camera permissions in your browser settings.',
  'device-not-found': 'No camera found. Please connect a webcam and try again.',
  'device-in-use': 'Camera is in use by another application. Please close other apps using the camera.',
  'unknown-error': 'An unexpected camera error occurred. Please try again.'
}

/**
 * User-friendly error messages for Shelly bulb errors.
 * These messages are suitable for audience viewing during demos.
 */
const SHELLY_ERROR_MESSAGES: Record<ShellyError, string> = {
  'network-error': 'Unable to connect to the bulb. Please check your network connection.',
  'timeout': 'Connection timed out. The bulb may be offline or unreachable.',
  'invalid-response': 'Received an unexpected response from the bulb. Please check the bulb configuration.',
  'bulb-offline': 'The bulb appears to be offline. Please check if it is powered on.'
}

/**
 * Format a webcam error into a user-friendly message.
 * Technical details are hidden from the audience.
 * 
 * @param error - The webcam error type
 * @returns A user-friendly error message
 */
export function formatWebcamError(error: WebcamError): string {
  return WEBCAM_ERROR_MESSAGES[error]
}

/**
 * Format a Shelly error into a user-friendly message.
 * Technical details are hidden from the audience.
 * 
 * @param error - The Shelly error type
 * @returns A user-friendly error message
 */
export function formatShellyError(error: ShellyError): string {
  return SHELLY_ERROR_MESSAGES[error]
}

/**
 * Log an error to the console with context for debugging.
 * This logs technical details that are not shown to the audience.
 * 
 * @param context - The context where the error occurred (e.g., 'WebcamService')
 * @param error - The error to log (can be any type)
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
}
