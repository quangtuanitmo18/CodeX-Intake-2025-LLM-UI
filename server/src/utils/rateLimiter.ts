// Simple in-memory rate limiter for WebSocket connections
// Tracks connections per user (by userId) with time windows

type RateLimitConfig = {
  maxConnections: number
  windowMs: number
}

class RateLimiter {
  private connections = new Map<number, number[]>() // userId -> timestamps[]
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = { maxConnections: 3, windowMs: 60000 }) {
    this.config = config
  }

  // Clean up old entries periodically
  private cleanup() {
    const now = Date.now()
    for (const [userId, timestamps] of this.connections.entries()) {
      const validTimestamps = timestamps.filter((ts) => now - ts < this.config.windowMs)
      if (validTimestamps.length === 0) {
        this.connections.delete(userId)
      } else {
        this.connections.set(userId, validTimestamps)
      }
    }
  }

  // Check if user can create new connection
  canConnect(userId: number): boolean {
    this.cleanup()
    const now = Date.now()
    const userConnections = this.connections.get(userId) || []

    // Filter out expired timestamps
    const validConnections = userConnections.filter((ts) => now - ts < this.config.windowMs)

    if (validConnections.length >= this.config.maxConnections) {
      return false
    }

    return true
  }

  // Record a new connection
  recordConnection(userId: number): void {
    const now = Date.now()
    const userConnections = this.connections.get(userId) || []
    userConnections.push(now)
    this.connections.set(userId, userConnections)
  }

  // Remove a connection (when it closes)
  removeConnection(userId: number): void {
    const userConnections = this.connections.get(userId)
    if (userConnections && userConnections.length > 0) {
      userConnections.shift() // Remove oldest connection
      if (userConnections.length === 0) {
        this.connections.delete(userId)
      }
    }
  }

  // Get current connection count for user
  getConnectionCount(userId: number): number {
    this.cleanup()
    const userConnections = this.connections.get(userId) || []
    const now = Date.now()
    return userConnections.filter((ts) => now - ts < this.config.windowMs).length
  }
}

// Export singleton instance
export const speechRateLimiter = new RateLimiter({
  maxConnections: 3, // Max 3 concurrent connections per user
  windowMs: 60000 // 1 minute window
})
