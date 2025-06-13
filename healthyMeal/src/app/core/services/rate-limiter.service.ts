import { Injectable } from '@angular/core';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
  private readonly MAX_REQUESTS = 10; // Maximum requests per window
  private rateLimits: Map<string, RateLimitInfo> = new Map();

  constructor() {
    // Clean up expired rate limits every minute
    setInterval(() => this.cleanupExpiredLimits(), this.RATE_LIMIT_WINDOW);
  }

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const limitInfo = this.rateLimits.get(endpoint);

    if (!limitInfo) {
      this.rateLimits.set(endpoint, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (now > limitInfo.resetTime) {
      // Reset window
      this.rateLimits.set(endpoint, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (limitInfo.count >= this.MAX_REQUESTS) {
      return false;
    }

    limitInfo.count++;
    return true;
  }

  getRemainingRequests(endpoint: string): number {
    const limitInfo = this.rateLimits.get(endpoint);
    if (!limitInfo) return this.MAX_REQUESTS;
    return Math.max(0, this.MAX_REQUESTS - limitInfo.count);
  }

  getResetTime(endpoint: string): number {
    const limitInfo = this.rateLimits.get(endpoint);
    if (!limitInfo) return Date.now() + this.RATE_LIMIT_WINDOW;
    return limitInfo.resetTime;
  }

  private cleanupExpiredLimits(): void {
    const now = Date.now();
    for (const [endpoint, info] of this.rateLimits.entries()) {
      if (now > info.resetTime) {
        this.rateLimits.delete(endpoint);
      }
    }
  }
} 