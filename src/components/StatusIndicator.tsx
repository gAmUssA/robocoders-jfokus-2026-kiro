/**
 * StatusIndicator Component - Displays connection status for webcam and bulb
 * 
 * Responsibilities:
 * - Display connection status with clear visual states
 * - Show connected, disconnected, and connecting states
 * - Use clear icons and colors visible from back of room
 * - Provide accessible status information
 * 
 * Requirements: 4.3
 */

import styles from './StatusIndicator.module.css'

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'
export type DeviceType = 'webcam' | 'bulb'

export interface StatusIndicatorProps {
  /** Type of device being monitored */
  type: DeviceType
  /** Current connection status */
  status: ConnectionStatus
}

/**
 * Get human-readable label for device type
 */
function getDeviceLabel(type: DeviceType): string {
  switch (type) {
    case 'webcam':
      return 'Webcam'
    case 'bulb':
      return 'Bulb'
    default:
      return 'Device'
  }
}

/**
 * Get human-readable status text
 */
function getStatusText(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'disconnected':
      return 'Disconnected'
    case 'connecting':
      return 'Connecting...'
    default:
      return 'Unknown'
  }
}

/**
 * Webcam icon SVG component
 */
function WebcamIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

/**
 * Bulb icon SVG component
 */
function BulbIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  )
}

export function StatusIndicator({ type, status }: StatusIndicatorProps) {
  const deviceLabel = getDeviceLabel(type)
  const statusText = getStatusText(status)
  const ariaLabel = `${deviceLabel}: ${statusText}`
  
  return (
    <div
      className={`${styles.container} ${styles[status]}`}
      data-testid={`status-indicator-${type}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className={styles.iconWrapper}>
        {type === 'webcam' ? <WebcamIcon /> : <BulbIcon />}
      </div>
      
      <div className={styles.content}>
        <span className={styles.label} data-testid={`status-label-${type}`}>
          {deviceLabel}
        </span>
        <span className={styles.status} data-testid={`status-text-${type}`}>
          {statusText}
        </span>
      </div>
      
      <div
        className={`${styles.indicator} ${styles[`indicator-${status}`]}`}
        data-testid={`status-dot-${type}`}
        aria-hidden="true"
      >
        {status === 'connecting' && (
          <div className={styles.pulse} />
        )}
      </div>
    </div>
  )
}
