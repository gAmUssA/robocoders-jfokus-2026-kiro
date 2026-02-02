import { describe, it, expect, vi } from 'vitest'

describe('Test setup verification', () => {
  it('should have fake timers configured', () => {
    const callback = vi.fn()
    
    // Use fake timers
    vi.useFakeTimers()
    
    setTimeout(callback, 1000)
    
    // Fast-forward time
    vi.advanceTimersByTime(1000)
    
    expect(callback).toHaveBeenCalledOnce()
    
    // Restore real timers
    vi.useRealTimers()
  })

  it('should support fast-check for property-based testing', async () => {
    // Dynamic import to verify fast-check is available
    const fc = await import('fast-check')
    
    expect(fc).toBeDefined()
    expect(fc.integer).toBeDefined()
  })
})
