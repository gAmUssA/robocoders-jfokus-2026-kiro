/**
 * StatusIndicator Component Tests
 * 
 * Tests for connection status display component
 * Requirements: 4.3
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusIndicator } from './StatusIndicator'
import type { ConnectionStatus, DeviceType } from './StatusIndicator'

describe('StatusIndicator', () => {
  describe('rendering', () => {
    it('renders webcam indicator with connected status', () => {
      render(<StatusIndicator type="webcam" status="connected" />)
      
      expect(screen.getByTestId('status-indicator-webcam')).toBeInTheDocument()
      expect(screen.getByTestId('status-label-webcam')).toHaveTextContent('Webcam')
      expect(screen.getByTestId('status-text-webcam')).toHaveTextContent('Connected')
    })
    
    it('renders bulb indicator with connected status', () => {
      render(<StatusIndicator type="bulb" status="connected" />)
      
      expect(screen.getByTestId('status-indicator-bulb')).toBeInTheDocument()
      expect(screen.getByTestId('status-label-bulb')).toHaveTextContent('Bulb')
      expect(screen.getByTestId('status-text-bulb')).toHaveTextContent('Connected')
    })
    
    it('renders webcam indicator with disconnected status', () => {
      render(<StatusIndicator type="webcam" status="disconnected" />)
      
      expect(screen.getByTestId('status-text-webcam')).toHaveTextContent('Disconnected')
    })
    
    it('renders bulb indicator with disconnected status', () => {
      render(<StatusIndicator type="bulb" status="disconnected" />)
      
      expect(screen.getByTestId('status-text-bulb')).toHaveTextContent('Disconnected')
    })
    
    it('renders webcam indicator with connecting status', () => {
      render(<StatusIndicator type="webcam" status="connecting" />)
      
      expect(screen.getByTestId('status-text-webcam')).toHaveTextContent('Connecting...')
    })
    
    it('renders bulb indicator with connecting status', () => {
      render(<StatusIndicator type="bulb" status="connecting" />)
      
      expect(screen.getByTestId('status-text-bulb')).toHaveTextContent('Connecting...')
    })
  })
  
  describe('visual states', () => {
    it('applies connected class for connected status', () => {
      render(<StatusIndicator type="webcam" status="connected" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      expect(container).toHaveClass('connected')
    })
    
    it('applies disconnected class for disconnected status', () => {
      render(<StatusIndicator type="webcam" status="disconnected" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      expect(container).toHaveClass('disconnected')
    })
    
    it('applies connecting class for connecting status', () => {
      render(<StatusIndicator type="webcam" status="connecting" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      expect(container).toHaveClass('connecting')
    })
    
    it('renders status dot with correct class for connected', () => {
      render(<StatusIndicator type="bulb" status="connected" />)
      
      const dot = screen.getByTestId('status-dot-bulb')
      expect(dot).toHaveClass('indicator-connected')
    })
    
    it('renders status dot with correct class for disconnected', () => {
      render(<StatusIndicator type="bulb" status="disconnected" />)
      
      const dot = screen.getByTestId('status-dot-bulb')
      expect(dot).toHaveClass('indicator-disconnected')
    })
    
    it('renders status dot with correct class for connecting', () => {
      render(<StatusIndicator type="bulb" status="connecting" />)
      
      const dot = screen.getByTestId('status-dot-bulb')
      expect(dot).toHaveClass('indicator-connecting')
    })
  })
  
  describe('accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<StatusIndicator type="webcam" status="connected" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      expect(container).toHaveAttribute('role', 'status')
    })
    
    it('has correct aria-label for webcam connected', () => {
      render(<StatusIndicator type="webcam" status="connected" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      expect(container).toHaveAttribute('aria-label', 'Webcam: Connected')
    })
    
    it('has correct aria-label for bulb disconnected', () => {
      render(<StatusIndicator type="bulb" status="disconnected" />)
      
      const container = screen.getByTestId('status-indicator-bulb')
      expect(container).toHaveAttribute('aria-label', 'Bulb: Disconnected')
    })
    
    it('has correct aria-label for webcam connecting', () => {
      render(<StatusIndicator type="webcam" status="connecting" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      expect(container).toHaveAttribute('aria-label', 'Webcam: Connecting...')
    })
    
    it('hides decorative status dot from screen readers', () => {
      render(<StatusIndicator type="bulb" status="connected" />)
      
      const dot = screen.getByTestId('status-dot-bulb')
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    })
  })
  
  describe('icons', () => {
    it('renders webcam icon for webcam type', () => {
      render(<StatusIndicator type="webcam" status="connected" />)
      
      const container = screen.getByTestId('status-indicator-webcam')
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // Webcam icon has a rect element
      expect(svg?.querySelector('rect')).toBeInTheDocument()
    })
    
    it('renders bulb icon for bulb type', () => {
      render(<StatusIndicator type="bulb" status="connected" />)
      
      const container = screen.getByTestId('status-indicator-bulb')
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // Bulb icon has multiple path elements
      const paths = svg?.querySelectorAll('path')
      expect(paths?.length).toBeGreaterThan(1)
    })
  })
  
  describe('all status combinations', () => {
    const deviceTypes: DeviceType[] = ['webcam', 'bulb']
    const statuses: ConnectionStatus[] = ['connected', 'disconnected', 'connecting']
    
    deviceTypes.forEach(type => {
      statuses.forEach(status => {
        it(`renders ${type} with ${status} status correctly`, () => {
          render(<StatusIndicator type={type} status={status} />)
          
          const container = screen.getByTestId(`status-indicator-${type}`)
          expect(container).toBeInTheDocument()
          expect(container).toHaveClass(status)
          
          const dot = screen.getByTestId(`status-dot-${type}`)
          expect(dot).toHaveClass(`indicator-${status}`)
        })
      })
    })
  })
})
