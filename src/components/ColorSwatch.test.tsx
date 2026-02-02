/**
 * Unit tests for ColorSwatch component
 * 
 * Tests:
 * - Component renders with correct color
 * - RGB values are displayed correctly
 * - Label is displayed
 * - Color updates are reflected
 * - Text color contrast is appropriate
 * 
 * Requirements: 4.1, 4.2, 4.5
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ColorSwatch } from './ColorSwatch'
import type { RGB } from '../types'

describe('ColorSwatch', () => {
  it('should render with provided color', () => {
    const color: RGB = { red: 255, green: 128, blue: 64 }
    render(<ColorSwatch color={color} label="Test Color" />)
    
    const swatch = screen.getByTestId('color-swatch-display')
    expect(swatch).toBeInTheDocument()
    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 128, 64)' })
  })
  
  it('should display RGB values in overlay', () => {
    const color: RGB = { red: 100, green: 150, blue: 200 }
    render(<ColorSwatch color={color} label="Current Color" />)
    
    const rgbText = screen.getByTestId('rgb-values')
    expect(rgbText).toHaveTextContent('RGB: 100, 150, 200')
  })
  
  it('should display individual channel values', () => {
    const color: RGB = { red: 50, green: 100, blue: 150 }
    render(<ColorSwatch color={color} label="Selected Color" />)
    
    expect(screen.getByTestId('red-value')).toHaveTextContent('50')
    expect(screen.getByTestId('green-value')).toHaveTextContent('100')
    expect(screen.getByTestId('blue-value')).toHaveTextContent('150')
  })
  
  it('should display the provided label', () => {
    const color: RGB = { red: 128, green: 128, blue: 128 }
    render(<ColorSwatch color={color} label="My Custom Label" />)
    
    expect(screen.getByText('My Custom Label')).toBeInTheDocument()
  })
  
  it('should update when color changes', () => {
    const color1: RGB = { red: 255, green: 0, blue: 0 }
    const { rerender } = render(<ColorSwatch color={color1} label="Color" />)
    
    let swatch = screen.getByTestId('color-swatch-display')
    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' })
    
    const color2: RGB = { red: 0, green: 255, blue: 0 }
    rerender(<ColorSwatch color={color2} label="Color" />)
    
    swatch = screen.getByTestId('color-swatch-display')
    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(0, 255, 0)' })
    expect(screen.getByTestId('rgb-values')).toHaveTextContent('RGB: 0, 255, 0')
  })
  
  it('should handle pure black color', () => {
    const color: RGB = { red: 0, green: 0, blue: 0 }
    render(<ColorSwatch color={color} label="Black" />)
    
    const swatch = screen.getByTestId('color-swatch-display')
    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(0, 0, 0)' })
    expect(screen.getByTestId('rgb-values')).toHaveTextContent('RGB: 0, 0, 0')
  })
  
  it('should handle pure white color', () => {
    const color: RGB = { red: 255, green: 255, blue: 255 }
    render(<ColorSwatch color={color} label="White" />)
    
    const swatch = screen.getByTestId('color-swatch-display')
    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 255, 255)' })
    expect(screen.getByTestId('rgb-values')).toHaveTextContent('RGB: 255, 255, 255')
  })
  
  it('should use light text on dark backgrounds', () => {
    const darkColor: RGB = { red: 20, green: 20, blue: 20 }
    render(<ColorSwatch color={darkColor} label="Dark Color" />)
    
    const rgbText = screen.getByTestId('rgb-values')
    // Text should be white (#ffffff) for dark backgrounds
    expect(rgbText).toHaveStyle({ color: '#ffffff' })
  })
  
  it('should use dark text on light backgrounds', () => {
    const lightColor: RGB = { red: 240, green: 240, blue: 240 }
    render(<ColorSwatch color={lightColor} label="Light Color" />)
    
    const rgbText = screen.getByTestId('rgb-values')
    // Text should be black (#000000) for light backgrounds
    expect(rgbText).toHaveStyle({ color: '#000000' })
  })
  
  it('should have accessible aria-label', () => {
    const color: RGB = { red: 123, green: 45, blue: 67 }
    render(<ColorSwatch color={color} label="Test" />)
    
    const swatch = screen.getByTestId('color-swatch-display')
    expect(swatch).toHaveAttribute('aria-label', 'Color swatch showing RGB 123, 45, 67')
  })
  
  it('should handle boundary values (0 and 255)', () => {
    const color: RGB = { red: 0, green: 128, blue: 255 }
    render(<ColorSwatch color={color} label="Boundary Test" />)
    
    expect(screen.getByTestId('red-value')).toHaveTextContent('0')
    expect(screen.getByTestId('green-value')).toHaveTextContent('128')
    expect(screen.getByTestId('blue-value')).toHaveTextContent('255')
  })
  
  it('should render all required elements', () => {
    const color: RGB = { red: 100, green: 100, blue: 100 }
    render(<ColorSwatch color={color} label="Complete Test" />)
    
    // Check all main elements are present
    expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
    expect(screen.getByTestId('color-swatch-display')).toBeInTheDocument()
    expect(screen.getByTestId('rgb-values')).toBeInTheDocument()
    expect(screen.getByTestId('red-value')).toBeInTheDocument()
    expect(screen.getByTestId('green-value')).toBeInTheDocument()
    expect(screen.getByTestId('blue-value')).toBeInTheDocument()
    expect(screen.getByText('Complete Test')).toBeInTheDocument()
  })
})
