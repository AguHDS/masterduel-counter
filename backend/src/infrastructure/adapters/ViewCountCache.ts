/**
 * In-memory cache for view counts to reduce database writes
 * 
 * Strategy:
 * - Accumulates view counts in memory
 * - Flushes to database periodically (every 30 seconds)
 * - Prevents excessive writes while maintaining accuracy
 */
export class ViewCountCache {
  private cache: Map<number, number> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;
  private flushCallback: (instanceId: number, count: number) => Promise<void>;
  private readonly FLUSH_INTERVAL_MS = 30000; // 30 seconds

  constructor(flushCallback: (instanceId: number, count: number) => Promise<void>) {
    this.flushCallback = flushCallback;
    this.startFlushInterval();
  }

  /**
   * Increments the view count for an instance in memory
   */
  increment(instanceId: number): void {
    const current = this.cache.get(instanceId) || 0;
    this.cache.set(instanceId, current + 1);
  }

  /**
   * Gets the current cached count for an instance
   */
  getCachedCount(instanceId: number): number {
    return this.cache.get(instanceId) || 0;
  }

  /**
   * Starts the periodic flush interval
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush().catch(error => {
        console.error('Error flushing view counts:', error);
      });
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Flushes all cached counts to the database
   */
  async flush(): Promise<void> {
    if (this.cache.size === 0) return;

    const entries = Array.from(this.cache.entries());
    this.cache.clear();

    // Process all flushes in parallel
    await Promise.all(
      entries.map(([instanceId, count]) => 
        this.flushCallback(instanceId, count).catch(error => {
          console.error(`Failed to flush view count for instance ${instanceId}:`, error);
          // Re-add to cache on failure
          const current = this.cache.get(instanceId) || 0;
          this.cache.set(instanceId, current + count);
        })
      )
    );
  }

  /**
   * Stops the flush interval and performs a final flush
   */
  async stop(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flush();
  }
}
