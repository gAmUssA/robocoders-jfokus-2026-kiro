/**
 * VideoFeed Component - Displays live webcam video stream
 * 
 * Responsibilities:
 * - Display live video stream from webcam when active
 * - Show placeholder message when webcam is inactive
 * - Ensure minimum 640x480 resolution for video display
 * - Automatically attach MediaStream to video element
 * 
 * Requirements: 1.4, 4.4
 */

import { useEffect, useRef } from 'react'
import styles from './VideoFeed.module.css'

export interface VideoFeedProps {
  /** MediaStream from webcam, or null if inactive */
  stream: MediaStream | null
  /** Whether webcam is currently active */
  isActive: boolean
}

export function VideoFeed({ stream, isActive }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Attach stream to video element when it changes
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (stream && isActive) {
      videoElement.srcObject = stream
    } else {
      videoElement.srcObject = null
    }

    // Cleanup on unmount
    return () => {
      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [stream, isActive])

  return (
    <div className={styles.container}>
      {isActive && stream ? (
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          playsInline
          muted
          data-testid="video-feed"
        />
      ) : (
        <div className={styles.placeholder} data-testid="video-placeholder">
          <div className={styles.placeholderContent}>
            <svg
              className={styles.placeholderIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p className={styles.placeholderText}>
              {isActive ? 'Connecting to webcam...' : 'Webcam inactive'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
