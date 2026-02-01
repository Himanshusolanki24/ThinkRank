"""
Unified Coding Signal Engine - FastAPI Application

This is the main entry point for the Python microservice that:
- Fetches data from coding platforms (Codeforces, LeetCode, CodeChef, HackerRank)
- Normalizes data into a unified skill profile
- Provides REST API for the Node.js backend

Endpoints:
- GET  /health                    - Health check
- POST /api/codeforces/{username} - Fetch Codeforces stats
- POST /api/leetcode/{username}   - Scrape LeetCode profile
- POST /api/codechef/{username}   - Scrape CodeChef profile  
- POST /api/hackerrank/{username} - Scrape HackerRank profile
- POST /api/unified               - Get unified normalized profile
- POST /api/normalize             - Normalize pre-fetched data
- GET  /api/cache/stats           - Get cache statistics

Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import asyncio
from contextlib import asynccontextmanager
import os

# Import scrapers and services
from scrapers.codeforces_api import CodeforcesAPI, CodeforcesAPIError
from scrapers.leetcode_scraper import LeetCodeScraper, LeetCodeScraperError
from scrapers.codechef_scraper import CodeChefScraper, CodeChefScraperError
from scrapers.hackerrank_scraper import HackerRankScraper, HackerRankScraperError
from normalization.normalizer import NormalizationEngine, normalize_coding_signals
from utils.cache import get_cache, async_cached_fetch


# Global scraper instances (lazy initialized)
_codeforces_api: Optional[CodeforcesAPI] = None
_leetcode_scraper: Optional[LeetCodeScraper] = None
_codechef_scraper: Optional[CodeChefScraper] = None
_hackerrank_scraper: Optional[HackerRankScraper] = None


async def get_codeforces_api() -> CodeforcesAPI:
    global _codeforces_api
    if _codeforces_api is None:
        _codeforces_api = CodeforcesAPI()
    return _codeforces_api


async def get_leetcode_scraper() -> LeetCodeScraper:
    global _leetcode_scraper
    if _leetcode_scraper is None:
        _leetcode_scraper = LeetCodeScraper()
    return _leetcode_scraper


async def get_codechef_scraper() -> CodeChefScraper:
    global _codechef_scraper
    if _codechef_scraper is None:
        _codechef_scraper = CodeChefScraper()
    return _codechef_scraper


async def get_hackerrank_scraper() -> HackerRankScraper:
    global _hackerrank_scraper
    if _hackerrank_scraper is None:
        _hackerrank_scraper = HackerRankScraper()
    return _hackerrank_scraper


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup
    print("🚀 Coding Signal Engine starting up...")
    yield
    # Shutdown - cleanup scrapers
    print("🛑 Shutting down Coding Signal Engine...")
    if _codeforces_api:
        await _codeforces_api.close()
    if _leetcode_scraper:
        await _leetcode_scraper.close()
    if _codechef_scraper:
        await _codechef_scraper.close()
    if _hackerrank_scraper:
        await _hackerrank_scraper.close()


# Create FastAPI app
app = FastAPI(
    title="Unified Coding Signal Engine",
    description="Aggregates skill signals from multiple coding platforms",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= Request/Response Models =============

class UnifiedProfileRequest(BaseModel):
    """Request model for unified profile fetch"""
    leetcode: Optional[str] = Field(None, description="LeetCode username")
    codeforces: Optional[str] = Field(None, description="Codeforces handle")
    codechef: Optional[str] = Field(None, description="CodeChef username")
    hackerrank: Optional[str] = Field(None, description="HackerRank username")
    github: Optional[Dict[str, Any]] = Field(None, description="Pre-fetched GitHub data")
    use_cache: bool = Field(True, description="Whether to use cached data")


class NormalizeRequest(BaseModel):
    """Request model for normalizing pre-fetched data"""
    codeforces: Optional[Dict[str, Any]] = None
    leetcode: Optional[Dict[str, Any]] = None
    codechef: Optional[Dict[str, Any]] = None
    hackerrank: Optional[Dict[str, Any]] = None
    github: Optional[Dict[str, Any]] = None


class ApiResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    cached: bool = False


# ============= Health Check =============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Unified Coding Signal Engine",
        "version": "1.0.0"
    }


# ============= Platform Endpoints =============

@app.post("/api/codeforces/{username}", response_model=ApiResponse)
async def fetch_codeforces(username: str, use_cache: bool = True):
    """
    Fetch Codeforces stats using official API
    
    This uses the official Codeforces REST API which is public
    and requires no authentication.
    """
    cache = get_cache()
    
    # Check cache first
    if use_cache and cache.has("codeforces", username):
        cached_data = cache.get("codeforces", username)
        return ApiResponse(success=True, data=cached_data, cached=True)
    
    try:
        api = await get_codeforces_api()
        data = await api.get_full_stats(username)
        
        # Cache the result
        cache.set("codeforces", username, data)
        
        return ApiResponse(success=True, data=data, cached=False)
    except CodeforcesAPIError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/api/leetcode/{username}", response_model=ApiResponse)
async def fetch_leetcode(username: str, use_cache: bool = True):
    """
    Scrape LeetCode public profile
    
    Uses Playwright to load the JS-rendered profile page
    and extract publicly visible statistics.
    """
    cache = get_cache()
    
    if use_cache and cache.has("leetcode", username):
        cached_data = cache.get("leetcode", username)
        return ApiResponse(success=True, data=cached_data, cached=True)
    
    try:
        scraper = await get_leetcode_scraper()
        data = await scraper.scrape_profile(username)
        
        cache.set("leetcode", username, data)
        
        return ApiResponse(success=True, data=data, cached=False)
    except LeetCodeScraperError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/api/codechef/{username}", response_model=ApiResponse)
async def fetch_codechef(username: str, use_cache: bool = True):
    """
    Scrape CodeChef public profile
    
    Uses Playwright to extract rating, stars, and problem stats
    from the public profile page.
    """
    cache = get_cache()
    
    if use_cache and cache.has("codechef", username):
        cached_data = cache.get("codechef", username)
        return ApiResponse(success=True, data=cached_data, cached=True)
    
    try:
        scraper = await get_codechef_scraper()
        data = await scraper.scrape_profile(username)
        
        cache.set("codechef", username, data)
        
        return ApiResponse(success=True, data=data, cached=False)
    except CodeChefScraperError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/api/hackerrank/{username}", response_model=ApiResponse)
async def fetch_hackerrank(username: str, use_cache: bool = True):
    """
    Scrape HackerRank public profile (optional/supplementary)
    
    Extracts badges and skill certifications if publicly visible.
    """
    cache = get_cache()
    
    if use_cache and cache.has("hackerrank", username):
        cached_data = cache.get("hackerrank", username)
        return ApiResponse(success=True, data=cached_data, cached=True)
    
    try:
        scraper = await get_hackerrank_scraper()
        data = await scraper.scrape_profile(username)
        
        cache.set("hackerrank", username, data)
        
        return ApiResponse(success=True, data=data, cached=False)
    except HackerRankScraperError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ============= Unified Profile Endpoint =============

@app.post("/api/unified", response_model=ApiResponse)
async def fetch_unified_profile(request: UnifiedProfileRequest):
    """
    Fetch and normalize data from all specified platforms
    
    This is the main endpoint that:
    1. Fetches data from each specified platform (with caching)
    2. Normalizes all data into a unified profile
    3. Returns both raw and normalized data
    
    Platforms not specified are skipped (not penalized in scoring).
    """
    platform_data = {}
    errors = {}
    cache = get_cache()
    
    # Fetch Codeforces
    if request.codeforces:
        try:
            if request.use_cache and cache.has("codeforces", request.codeforces):
                platform_data["codeforces"] = cache.get("codeforces", request.codeforces)
            else:
                api = await get_codeforces_api()
                data = await api.get_full_stats(request.codeforces)
                cache.set("codeforces", request.codeforces, data)
                platform_data["codeforces"] = data
        except Exception as e:
            errors["codeforces"] = str(e)
    
    # Fetch LeetCode
    if request.leetcode:
        try:
            if request.use_cache and cache.has("leetcode", request.leetcode):
                platform_data["leetcode"] = cache.get("leetcode", request.leetcode)
            else:
                scraper = await get_leetcode_scraper()
                data = await scraper.scrape_profile(request.leetcode)
                cache.set("leetcode", request.leetcode, data)
                platform_data["leetcode"] = data
        except Exception as e:
            errors["leetcode"] = str(e)
    
    # Fetch CodeChef
    if request.codechef:
        try:
            if request.use_cache and cache.has("codechef", request.codechef):
                platform_data["codechef"] = cache.get("codechef", request.codechef)
            else:
                scraper = await get_codechef_scraper()
                data = await scraper.scrape_profile(request.codechef)
                cache.set("codechef", request.codechef, data)
                platform_data["codechef"] = data
        except Exception as e:
            errors["codechef"] = str(e)
    
    # Fetch HackerRank
    if request.hackerrank:
        try:
            if request.use_cache and cache.has("hackerrank", request.hackerrank):
                platform_data["hackerrank"] = cache.get("hackerrank", request.hackerrank)
            else:
                scraper = await get_hackerrank_scraper()
                data = await scraper.scrape_profile(request.hackerrank)
                cache.set("hackerrank", request.hackerrank, data)
                platform_data["hackerrank"] = data
        except Exception as e:
            errors["hackerrank"] = str(e)
    
    # Include GitHub if provided
    if request.github:
        platform_data["github"] = request.github
    
    # Normalize the data
    normalized = normalize_coding_signals(
        codeforces=platform_data.get("codeforces"),
        leetcode=platform_data.get("leetcode"),
        codechef=platform_data.get("codechef"),
        hackerrank=platform_data.get("hackerrank"),
        github=platform_data.get("github")
    )
    
    return ApiResponse(
        success=True,
        data={
            "raw": platform_data,
            "normalized": normalized,
            "errors": errors if errors else None
        },
        cached=False
    )


@app.post("/api/normalize", response_model=ApiResponse)
async def normalize_data(request: NormalizeRequest):
    """
    Normalize pre-fetched platform data
    
    Use this when you have already fetched the raw data
    and just need normalization.
    """
    normalized = normalize_coding_signals(
        codeforces=request.codeforces,
        leetcode=request.leetcode,
        codechef=request.codechef,
        hackerrank=request.hackerrank,
        github=request.github
    )
    
    return ApiResponse(success=True, data=normalized)


# ============= Cache Management =============

@app.get("/api/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    cache = get_cache()
    return cache.get_stats()


@app.delete("/api/cache/{platform}/{username}")
async def invalidate_cache(platform: str, username: str):
    """Invalidate a specific cache entry"""
    cache = get_cache()
    was_cached = cache.invalidate(platform, username)
    return {
        "success": True,
        "invalidated": was_cached,
        "key": f"{platform}:{username}"
    }


@app.delete("/api/cache")
async def clear_cache():
    """Clear all cache entries"""
    cache = get_cache()
    cache.clear()
    return {"success": True, "message": "Cache cleared"}


# ============= Run Information =============

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
