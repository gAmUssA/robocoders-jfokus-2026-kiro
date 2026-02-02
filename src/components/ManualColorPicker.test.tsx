/**
 * ManualColorPicker Component Tests
 * Requirements: 5.1, 5.2, 5.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ManualColorPicker } from './ManualColorPicker'
import type { RGB } from '../types'

describe('ManualColorPicker', () => {
  const defaultColor: RGB = { red: 128, green: 128, blue: 128 }
  let mockOnColorSelect: (color: RGB) => void
  
  beforeEach(() => {
    mockOnColorSelect = vi.fn()
  })
  
  describe('Rendering', () => {
    it('should render the component with title', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByText('Manual Color Picker')).toBeInTheDocument()
    })
    
    it('should render color preview with current color', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const preview = screen.getByTestId('color-preview')
      expect(preview).toHaveStyle({ backgroundColor: 'rgb(128, 128, 128)' })
    })
    
    it('should render RGB sliders', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByTestId('red-slider')).toBeInTheDocument()
      expect(screen.getByTestId('green-slider')).toBeInTheDocument()
      expect(screen.getByTestId('blue-slider')).toBeInTheDocument()
    })
    
    it('should render RGB input fields', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByTestId('red-input')).toHaveValue(128)
      expect(screen.getByTestId('green-input')).toHaveValue(128)
      expect(screen.getByTestId('blue-input')).toHaveValue(128)
    })
    
    it('should render quick color presets', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByTestId('preset-red')).toBeInTheDocument()
      expect(screen.getByTestId('preset-green')).toBeInTheDocument()
      expect(screen.getByTestId('preset-blue')).toBeInTheDocument()
    })
  })
  
  describe('RGB Slider Interactions', () => {
    it('should call onColorSelect when red slider changes', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const redSlider = screen.getByTestId('red-slider')
      fireEvent.change(redSlider, { target: { value: '200' } })
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 200, green: 128, blue: 128 })
    })
    
    it('should call onColorSelect when green slider changes', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const greenSlider = screen.getByTestId('green-slider')
      fireEvent.change(greenSlider, { target: { value: '50' } })
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 128, green: 50, blue: 128 })
    })
    
    it('should call onColorSelect when blue slider changes', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const blueSlider = screen.getByTestId('blue-slider')
      fireEvent.change(blueSlider, { target: { value: '255' } })
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 128, green: 128, blue: 255 })
    })
  })
  
  describe('RGB Input Interactions', () => {
    it('should call onColorSelect when red input changes', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const redInput = screen.getByTestId('red-input')
      fireEvent.change(redInput, { target: { value: '100' } })
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 100, green: 128, blue: 128 })
    })
    
    it('should clamp values above 255 to 255', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const redInput = screen.getByTestId('red-input')
      fireEvent.change(redInput, { target: { value: '300' } })
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 255, green: 128, blue: 128 })
    })
    
    it('should clamp negative values to 0', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      const greenInput = screen.getByTestId('green-input')
      fireEvent.change(greenInput, { target: { value: '-50' } })
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 128, green: 0, blue: 128 })
    })
  })
  
  describe('Preset Color Buttons', () => {
    it('should call onColorSelect with red when red preset is clicked', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      fireEvent.click(screen.getByTestId('preset-red'))
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 255, green: 0, blue: 0 })
    })
    
    it('should call onColorSelect with green when green preset is clicked', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      fireEvent.click(screen.getByTestId('preset-green'))
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 0, green: 255, blue: 0 })
    })
    
    it('should call onColorSelect with blue when blue preset is clicked', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      fireEvent.click(screen.getByTestId('preset-blue'))
      expect(mockOnColorSelect).toHaveBeenCalledWith({ red: 0, green: 0, blue: 255 })
    })
  })
  
  describe('External Color Updates', () => {
    it('should update display when currentColor prop changes', () => {
      const { rerender } = render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByTestId('red-input')).toHaveValue(128)
      
      const newColor: RGB = { red: 200, green: 100, blue: 50 }
      rerender(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={newColor} />)
      
      expect(screen.getByTestId('red-input')).toHaveValue(200)
      expect(screen.getByTestId('green-input')).toHaveValue(100)
      expect(screen.getByTestId('blue-input')).toHaveValue(50)
    })
  })
  
  describe('Accessibility', () => {
    it('should have accessible labels for sliders', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByLabelText('Red slider')).toBeInTheDocument()
      expect(screen.getByLabelText('Green slider')).toBeInTheDocument()
      expect(screen.getByLabelText('Blue slider')).toBeInTheDocument()
    })
    
    it('should have accessible labels for inputs', () => {
      render(<ManualColorPicker onColorSelect={mockOnColorSelect} currentColor={defaultColor} />)
      expect(screen.getByLabelText('Red value')).toBeInTheDocument()
      expect(screen.getByLabelText('Green value')).toBeInTheDocument()
      expect(screen.getByLabelText('Blue value')).toBeInTheDocument()
    })
  })
})
