"""
Caching Layer for Coding Signals

Implements a 24-hour TTL cache to:
- Reduce load on external platforms
- Improve response times for repeated requests
- Comply with rate limiting and ethical scraping practices

Cache Strategy:
- Key: platform + username (lowercase)
- TTL: 24 hours (86400 seconds)
- Storage: In-memory (for development)
- Production: Consider Redis for persistence
"""

from typing import Dict, Any, Optional
from cachetools import TTLCache
import time
import hashlib
import json


# Default TTL: 24 hours in seconds
DEFAULT_TTL = 86400

# Max cache size: 1000 entries
MAX_CACHE_SIZE = 1000


class CodingSignalsCache:
    """
    TTL Cache for coding platform signals
    
    Usage:
        cache = CodingSignalsCache()
        
        # Set value
        cache.set("leetcode", "username", {"solved": 100})
        
        # Get value (returns None if expired or not found)
        data = cache.get("leetcode", "username")
        
        # Check if cached
        if cache.has("leetcode", "username"):
            ...
    """
    
    def __init__(self, ttl: int = DEFAULT_TTL, max_size: int = MAX_CACHE_SIZE):
        """
        Initialize cache
        
        Args:
            ttl: Time-to-live in seconds (default: 24 hours)
            max_size: Maximum number of entries (default: 1000)
        """
        self._cache = TTLCache(maxsize=max_size, ttl=ttl)
        self._ttl = ttl
    
    @staticmethod
    def _make_key(platform: str, username: str) -> str:
        """Generate cache key from platform and username"""
        return f"{platform.lower()}:{username.lower()}"
    
    def get(self, platform: str, username: str) -> Optional[Dict[str, Any]]:
        """
        Get cached data for a platform/username combo
        
        Args:
            platform: Platform name (leetcode, codeforces, etc.)
            username: Username on that platform
            
        Returns:
            Cached data dict or None if not found/expired
        """
        key = self._make_key(platform, username)
        try:
            data = self._cache.get(key)
            if data:
                return data.get("value")
            return None
        except KeyError:
            return None
    
    def set(self, platform: str, username: str, value: Dict[str, Any]) -> None:
        """
        Cache data for a platform/username combo
        
        Args:
            platform: Platform name
            username: Username on that platform
            value: Data to cache
        """
        key = self._make_key(platform, username)
        self._cache[key] = {
            "value": value,
            "cached_at": time.time()
        }
    
    def has(self, platform: str, username: str) -> bool:
        """
        Check if a platform/username combo is in cache
        
        Args:
            platform: Platform name
            username: Username on that platform
            
        Returns:
            True if cached and not expired
        """
        key = self._make_key(platform, username)
        return key in self._cache
    
    def invalidate(self, platform: str, username: str) -> bool:
        """
        Remove a specific entry from cache
        
        Args:
            platform: Platform name
            username: Username on that platform
            
        Returns:
            True if entry was found and removed
        """
        key = self._make_key(platform, username)
        try:
            del self._cache[key]
            return True
        except KeyError:
            return False
    
    def clear(self) -> None:
        """Clear all cached entries"""
        self._cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "size": len(self._cache),
            "max_size": self._cache.maxsize,
            "ttl_seconds": self._ttl,
            "ttl_hours": self._ttl / 3600
        }
    
    def get_all_keys(self) -> list:
        """Get all current cache keys (for debugging)"""
        return list(self._cache.keys())


# Global cache instance for the application
_global_cache: Optional[CodingSignalsCache] = None


def get_cache() -> CodingSignalsCache:
    """Get or create the global cache instance"""
    global _global_cache
    if _global_cache is None:
        _global_cache = CodingSignalsCache()
    return _global_cache


def cached_fetch(platform: str, username: str, fetch_func):
    """
    Decorator pattern for cached fetching
    
    Usage:
        async def fetch_leetcode(username):
            return await cached_fetch(
                "leetcode",
                username, 
                lambda: leetcode_scraper.scrape_profile(username)
            )
    """
    cache = get_cache()
    
    # Check cache first
    cached_data = cache.get(platform, username)
    if cached_data:
        cached_data["_cached"] = True
        return cached_data
    
    # If not cached, call the fetch function
    # Note: This is synchronous; for async, use the async version below
    data = fetch_func()
    
    # Cache the result
    cache.set(platform, username, data)
    data["_cached"] = False
    
    return data


async def async_cached_fetch(platform: str, username: str, fetch_coro):
    """
    Async version of cached_fetch
    
    Usage:
        data = await async_cached_fetch(
            "leetcode",
            username,
            scraper.scrape_profile(username)
        )
    """
    cache = get_cache()
    
    # Check cache first
    cached_data = cache.get(platform, username)
    if cached_data:
        result = dict(cached_data)
        result["_cached"] = True
        return result
    
    # If not cached, await the coroutine
    data = await fetch_coro
    
    # Cache the result
    cache.set(platform, username, data)
    result = dict(data)
    result["_cached"] = False
    
    return result
