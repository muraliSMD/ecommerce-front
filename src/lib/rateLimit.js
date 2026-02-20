import { NextResponse } from 'next/server';

const requestCache = new Map();

/**
 * Basic in-memory rate limiter for API routes.
 * Suitable for environments where standard middleware rate limiting libraries aren't available,
 * or where a simple IP-based bucket is sufficient for MVP protection.
 * Note: In a heavily load-balanced or serverless environment without shared memory, 
 * this works per-instance. For true distributed rate limiting, consider Upstash/Redis.
 */
export function rateLimit(request, limit = 10, windowMs = 60000) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries periodically to prevent memory leaks in long-running processes
    if (requestCache.size > 1000) {
        for (const [key, data] of requestCache.entries()) {
            if (data.resetTime < now) {
                requestCache.delete(key);
            }
        }
    }

    let userCache = requestCache.get(ip);
    
    if (!userCache || userCache.resetTime < now) {
        // First request in the new window
        userCache = {
            count: 1,
            resetTime: now + windowMs
        };
        requestCache.set(ip, userCache);
    } else {
        // Existing window
        userCache.count += 1;
        requestCache.set(ip, userCache);
    }

    if (userCache.count > limit) {
        return NextResponse.json(
            { message: 'Too many requests, please try again later.' },
            { 
               status: 429,
               headers: {
                 'Retry-After': Math.ceil((userCache.resetTime - now) / 1000).toString()
               }
            }
        );
    }

    return null; // Null means passed
}
