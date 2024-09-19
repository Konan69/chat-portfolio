import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class RedisRateLimiter {
  static instance: Ratelimit;
  static cache = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "20 m"),
        // ephemeralCache: this.cache,
      });
    }
    return this.instance;
  }
}
