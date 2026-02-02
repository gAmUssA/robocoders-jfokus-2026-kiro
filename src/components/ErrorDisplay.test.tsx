/**
 * ErrorDisplay Component Tests
 * 
 * Tests for error message display component
 * Requirements: 6.3, 6.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay } from './ErrorDisplay'
import type { WebcamError, ShellyError } from '../types'

describe('ErrorDisplay', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('webcam errors', () => {
    it('renders user-friendly message for permission-denied', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Camera access was denied. Please allow camera permissions in your browser settings.'
      )
    })

    it('renders user-friendly message for device-not-found', () => {
      render(<ErrorDisplay type="webcam" error="device-not-found" />)
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'No camera found. Please connect a webcam and try again.'
      )
    })

    it('renders user-friendly message for device-in-use', () => {
      render(<ErrorDisplay type="webcam" error="device-in-use" />)
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Camera is in use by another application. Please close other apps using the camera.'
      )
    })

    it('renders user-friendly message for unknown-error', () => {
      render(<ErrorDisplay type="webcam" error="unknown-error" />)
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'An unexpected camera error occurred. Please try again.'
      )
    })
  })

  describe('shelly errors', () => {
    it('renders user-friendly message for network-error', () => {
      render(<ErrorDisplay type="shelly" error="network-error" />)
      
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Unable to connect to the bulb. Please check your network connection.'
      )
    })

    it('renders user-friendly message for timeout', () => {
      render(<ErrorDisplay type="shelly" error="timeout" />)
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Connection timed out. The bulb may be offline or unreachable.'
      )
    })

    it('renders user-friendly message for invalid-response', () => {
      render(<ErrorDisplay type="shelly" error="invalid-response" />)
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Received an unexpected response from the bulb. Please check the bulb configuration.'
      )
    })

    it('renders user-friendly message for bulb-offline', () => {
      render(<ErrorDisplay type="shelly" error="bulb-offline" />)
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'The bulb appears to be offline. Please check if it is powered on.'
      )
    })
  })

  describe('error title', () => {
    it('shows "Camera Error" title for webcam errors', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      expect(screen.getByTestId('error-title')).toHaveTextContent('Camera Error')
    })

    it('shows "Bulb Connection Error" title for shelly errors', () => {
      render(<ErrorDisplay type="shelly" error="network-error" />)
      
      expect(screen.getByTestId('error-title')).toHaveTextContent('Bulb Connection Error')
    })
  })

  describe('dismiss functionality', () => {
    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()
      render(<ErrorDisplay type="webcam" error="permission-denied" onDismiss={onDismiss} />)
      
      const dismissButton = screen.getByTestId('error-dismiss-button')
      fireEvent.click(dismissButton)
      
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('does not render dismiss button when onDismiss is not provided', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      expect(screen.queryByTestId('error-dismiss-button')).not.toBeInTheDocument()
    })
  })

  describe('retry functionality', () => {
    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<ErrorDisplay type="webcam" error="permission-denied" onRetry={onRetry} />)
      
      const retryButton = screen.getByTestId('error-retry-button')
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not render retry button when onRetry is not provided', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument()
    })
  })

  describe('visual styling', () => {
    it('applies error class to container', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      const container = screen.getByTestId('error-display')
      expect(container).toHaveClass('error')
    })

    it('applies webcam type class', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      const container = screen.getByTestId('error-display')
      expect(container).toHaveClass('webcam')
    })

    it('applies shelly type class', () => {
      render(<ErrorDisplay type="shelly" error="network-error" />)
      
      const container = screen.getByTestId('error-display')
      expect(container).toHaveClass('shelly')
    })
  })

  describe('accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      const container = screen.getByTestId('error-display')
      expect(container).toHaveAttribute('role', 'alert')
    })

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      const container = screen.getByTestId('error-display')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('console logging', () => {
    it('logs technical details to console for webcam errors', () => {
      render(<ErrorDisplay type="webcam" error="permission-denied" />)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ErrorDisplay]', {
        type: 'webcam',
        error: 'permission-denied'
      })
    })

    it('logs technical details to console for shelly errors', () => {
      render(<ErrorDisplay type="shelly" error="timeout" />)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ErrorDisplay]', {
        type: 'shelly',
        error: 'timeout'
      })
    })
  })

  describe('all error combinations', () => {
    const webcamErrors: WebcamError[] = ['permission-denied', 'device-not-found', 'device-in-use', 'unknown-error']
    const shellyErrors: ShellyError[] = ['network-error', 'timeout', 'invalid-response', 'bulb-offline']

    webcamErrors.forEach(error => {
      it(`renders webcam ${error} without crashing`, () => {
        render(<ErrorDisplay type="webcam" error={error} />)
        
        expect(screen.getByTestId('error-display')).toBeInTheDocument()
        expect(screen.getByTestId('error-message').textContent).toBeTruthy()
      })
    })

    shellyErrors.forEach(error => {
      it(`renders shelly ${error} without crashing`, () => {
        render(<ErrorDisplay type="shelly" error={error} />)
        
        expect(screen.getByTestId('error-display')).toBeInTheDocument()
        expect(screen.getByTestId('error-message').textContent).toBeTruthy()
      })
    })
  })
})
