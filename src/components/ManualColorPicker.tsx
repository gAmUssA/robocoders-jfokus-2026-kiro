/**
 * ManualColorPicker Component - Fallback color picker for manual mode
 * 
 * Responsibilities:
 * - Provide RGB sliders for full color selection (0-255 range)
 * - Show visual preview of selected color
 * - Trigger color update callback on selection
 * - Support both slider and direct input for RGB values
 * 
 * Requirements: 5.1, 5.2, 5.5
 */

import { useState, useCallback, useEffect } from 'react'
import type { RGB } from '../types'
import styles from './ManualColorPicker.module.css'

export interface ManualColorPickerProps {
  /** Callback when user selects a color */
  onColorSelect: (color: RGB) => void
  /** Current color to display (for initial state and external updates) */
  currentColor: RGB
}

/**
 * Clamp a value to the valid RGB range [0, 255]
 */
function clampRGB(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

/**
 * Parse a string input to a valid RGB value
 */
function parseRGBInput(input: string): number {
  const parsed = parseInt(input, 10)
  if (isNaN(parsed)) {
    return 0
  }
  return clampRGB(parsed)
}

export function ManualColorPicker({ onColorSelect, currentColor }: ManualColorPickerProps) {
  // Local state for the color being edited
  const [color, setColor] = useState<RGB>(currentColor)
  
  // Sync with external currentColor changes
  useEffect(() => {
    setColor(currentColor)
  }, [currentColor])
  
  /**
   * Handle slider change for a specific channel
   */
  const handleSliderChange = useCallback((channel: keyof RGB, value: number) => {
    const newColor = {
      ...color,
      [channel]: clampRGB(value)
    }
    setColor(newColor)
    onColorSelect(newColor)
  }, [color, onColorSelect])
  
  /**
   * Handle direct input change for a specific channel
   */
  const handleInputChange = useCallback((channel: keyof RGB, inputValue: string) => {
    const value = parseRGBInput(inputValue)
    const newColor = {
      ...color,
      [channel]: value
    }
    setColor(newColor)
    onColorSelect(newColor)
  }, [color, onColorSelect])
  
  /**
   * Handle hex color input
   */
  const handleHexChange = useCallback((hexValue: string) => {
    // Remove # if present
    const hex = hexValue.replace('#', '')
    
    if (hex.length === 6) {
      const red = parseInt(hex.substring(0, 2), 16)
      const green = parseInt(hex.substring(2, 4), 16)
      const blue = parseInt(hex.substring(4, 6), 16)
      
      if (!isNaN(red) && !isNaN(green) && !isNaN(blue)) {
        const newColor = { red, green, blue }
        setColor(newColor)
        onColorSelect(newColor)
      }
    }
  }, [onColorSelect])
  
  // Generate CSS color string for preview
  const colorString = `rgb(${color.red}, ${color.green}, ${color.blue})`
  
  // Generate hex string for the color input
  const hexString = `#${color.red.toString(16).padStart(2, '0')}${color.green.toString(16).padStart(2, '0')}${color.blue.toString(16).padStart(2, '0')}`
  
  // Calculate luminance for text color contrast
  const luminance = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue) / 255
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff'
  
  return (
    <div className={styles.container} data-testid="manual-color-picker">
      <h2 className={styles.title}>Manual Color Picker</h2>
      
      {/* Color preview */}
      <div
        className={styles.preview}
        style={{ backgroundColor: colorString }}
        data-testid="color-preview"
        aria-label={`Color preview showing RGB ${color.red}, ${color.green}, ${color.blue}`}
      >
        <span className={styles.previewText} style={{ color: textColor }}>
          {hexString.toUpperCase()}
        </span>
      </div>
      
      {/* RGB Sliders */}
      <div className={styles.sliders}>
        {/* Red channel */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="red-slider">
            <span className={styles.channelName} style={{ color: '#e74c3c' }}>Red</span>
            <input
              type="number"
              className={styles.valueInput}
              value={color.red}
              onChange={(e) => handleInputChange('red', e.target.value)}
              min={0}
              max={255}
              data-testid="red-input"
              aria-label="Red value"
            />
          </label>
          <input
            id="red-slider"
            type="range"
            className={`${styles.slider} ${styles.redSlider}`}
            value={color.red}
            onChange={(e) => handleSliderChange('red', parseInt(e.target.value, 10))}
            min={0}
            max={255}
            data-testid="red-slider"
            aria-label="Red slider"
          />
        </div>
        
        {/* Green channel */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="green-slider">
            <span className={styles.channelName} style={{ color: '#27ae60' }}>Green</span>
            <input
              type="number"
              className={styles.valueInput}
              value={color.green}
              onChange={(e) => handleInputChange('green', e.target.value)}
              min={0}
              max={255}
              data-testid="green-input"
              aria-label="Green value"
            />
          </label>
          <input
            id="green-slider"
            type="range"
            className={`${styles.slider} ${styles.greenSlider}`}
            value={color.green}
            onChange={(e) => handleSliderChange('green', parseInt(e.target.value, 10))}
            min={0}
            max={255}
            data-testid="green-slider"
            aria-label="Green slider"
          />
        </div>
        
        {/* Blue channel */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="blue-slider">
            <span className={styles.channelName} style={{ color: '#3498db' }}>Blue</span>
            <input
              type="number"
              className={styles.valueInput}
              value={color.blue}
              onChange={(e) => handleInputChange('blue', e.target.value)}
              min={0}
              max={255}
              data-testid="blue-input"
              aria-label="Blue value"
            />
          </label>
          <input
            id="blue-slider"
            type="range"
            className={`${styles.slider} ${styles.blueSlider}`}
            value={color.blue}
            onChange={(e) => handleSliderChange('blue', parseInt(e.target.value, 10))}
            min={0}
            max={255}
            data-testid="blue-slider"
            aria-label="Blue slider"
          />
        </div>
      </div>
      
      {/* Hex color input */}
      <div className={styles.hexInput}>
        <label className={styles.hexLabel} htmlFor="hex-input">
          Hex Color:
          <input
            id="hex-input"
            type="color"
            className={styles.colorInput}
            value={hexString}
            onChange={(e) => handleHexChange(e.target.value)}
            data-testid="hex-input"
            aria-label="Hex color picker"
          />
          <input
            type="text"
            className={styles.hexTextInput}
            value={hexString.toUpperCase()}
            onChange={(e) => handleHexChange(e.target.value)}
            maxLength={7}
            data-testid="hex-text-input"
            aria-label="Hex color value"
          />
        </label>
      </div>
      
      {/* Quick color presets */}
      <div className={styles.presets}>
        <span className={styles.presetsLabel}>Quick Colors:</span>
        <div className={styles.presetButtons}>
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#ff0000' }}
            onClick={() => onColorSelect({ red: 255, green: 0, blue: 0 })}
            aria-label="Red preset"
            data-testid="preset-red"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#00ff00' }}
            onClick={() => onColorSelect({ red: 0, green: 255, blue: 0 })}
            aria-label="Green preset"
            data-testid="preset-green"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#0000ff' }}
            onClick={() => onColorSelect({ red: 0, green: 0, blue: 255 })}
            aria-label="Blue preset"
            data-testid="preset-blue"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#ffff00' }}
            onClick={() => onColorSelect({ red: 255, green: 255, blue: 0 })}
            aria-label="Yellow preset"
            data-testid="preset-yellow"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#ff00ff' }}
            onClick={() => onColorSelect({ red: 255, green: 0, blue: 255 })}
            aria-label="Magenta preset"
            data-testid="preset-magenta"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#00ffff' }}
            onClick={() => onColorSelect({ red: 0, green: 255, blue: 255 })}
            aria-label="Cyan preset"
            data-testid="preset-cyan"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#ffffff', border: '1px solid #ccc' }}
            onClick={() => onColorSelect({ red: 255, green: 255, blue: 255 })}
            aria-label="White preset"
            data-testid="preset-white"
          />
          <button
            className={styles.presetButton}
            style={{ backgroundColor: '#ff8c00' }}
            onClick={() => onColorSelect({ red: 255, green: 140, blue: 0 })}
            aria-label="Orange preset"
            data-testid="preset-orange"
          />
        </div>
      </div>
    </div>
  )
}
