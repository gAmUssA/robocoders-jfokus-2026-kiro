/**
 * ColorSwatch Component - Displays current dominant color with RGB values
 * 
 * Responsibilities:
 * - Display large color preview visible from back of room
 * - Show RGB values in large, readable text
 * - Update within 100ms of color changes (React's default rendering is sufficient)
 * - Provide clear visual feedback of current color state
 * 
 * Requirements: 4.1, 4.2, 4.5
 */

import type { RGB } from '../types'
import styles from './ColorSwatch.module.css'

export interface ColorSwatchProps {
  /** Current RGB color to display */
  color: RGB
  /** Label for the color swatch (e.g., "Current Color", "Selected Color") */
  label: string
}

export function ColorSwatch({ color, label }: ColorSwatchProps) {
  const { red, green, blue } = color
  
  // Generate CSS color string
  const colorString = `rgb(${red}, ${green}, ${blue})`
  
  // Calculate luminance to determine if text should be light or dark
  // Using relative luminance formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff'
  
  return (
    <div className={styles.container} data-testid="color-swatch">
      <h2 className={styles.label}>{label}</h2>
      
      <div
        className={styles.swatch}
        style={{ backgroundColor: colorString }}
        data-testid="color-swatch-display"
        aria-label={`Color swatch showing RGB ${red}, ${green}, ${blue}`}
      >
        <div className={styles.rgbOverlay} style={{ color: textColor }}>
          <span className={styles.rgbValue} data-testid="rgb-values">
            RGB: {red}, {green}, {blue}
          </span>
        </div>
      </div>
      
      <div className={styles.rgbDetails}>
        <div className={styles.rgbChannel}>
          <span className={styles.channelLabel}>R</span>
          <span className={styles.channelValue} data-testid="red-value">{red}</span>
        </div>
        <div className={styles.rgbChannel}>
          <span className={styles.channelLabel}>G</span>
          <span className={styles.channelValue} data-testid="green-value">{green}</span>
        </div>
        <div className={styles.rgbChannel}>
          <span className={styles.channelLabel}>B</span>
          <span className={styles.channelValue} data-testid="blue-value">{blue}</span>
        </div>
      </div>
    </div>
  )
}
