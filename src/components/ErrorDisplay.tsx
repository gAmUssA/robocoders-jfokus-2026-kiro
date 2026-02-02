/**
 * ErrorDisplay Component
 * 
 * Displays user-friendly error messages for webcam and Shelly bulb errors.
 * Technical details are logged to console for debugging.
 * 
 * Requirements: 6.3, 6.4
 */

import { useEffect } from 'react'
import type { WebcamError, ShellyError } from '../types'
import { formatWebcamError, formatShellyError, logError } from '../utils/errorUtils'
import styles from './ErrorDisplay.module.css'

export type ErrorType = 'webcam' | 'shelly'

export interface ErrorDisplayProps {
  /** The type of error (webcam or shelly) */
  type: ErrorType
  /** The specific error code */
  error: WebcamError | ShellyError
  /** Optional callback when dismiss button is clicked */
  onDismiss?: () => void
  /** Optional callback when retry button is clicked */
  onRetry?: () => void
}

/**
 * Get the title for the error based on type
 */
function getErrorTitle(type: ErrorType): string {
  return type === 'webcam' ? 'Camera Error' : 'Bulb Connection Error'
}

/**
 * Get the formatted error message based on type and error code
 */
function getErrorMessage(type: ErrorType, error: WebcamError | ShellyError): string {
  if (type === 'webcam') {
    return formatWebcamError(error as WebcamError)
  }
  return formatShellyError(error as ShellyError)
}

/**
 * ErrorDisplay component for showing user-friendly error messages.
 * Logs technical details to console for debugging.
 */
export function ErrorDisplay({ type, error, onDismiss, onRetry }: ErrorDisplayProps) {
  // Log technical details to console for debugging (Requirement 6.4)
  useEffect(() => {
    logError('ErrorDisplay', { type, error })
  }, [type, error])

  const title = getErrorTitle(type)
  const message = getErrorMessage(type, error)

  return (
    <div
      data-testid="error-display"
      className={`${styles.error} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          {type === 'webcam' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className={styles.text}>
          <h3 data-testid="error-title" className={styles.title}>
            {title}
          </h3>
          <p data-testid="error-message" className={styles.message}>
            {message}
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        {onRetry && (
          <button
            data-testid="error-retry-button"
            className={styles.retryButton}
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            data-testid="error-dismiss-button"
            className={styles.dismissButton}
            onClick={onDismiss}
            type="button"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
