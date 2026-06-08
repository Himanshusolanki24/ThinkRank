"""
CodeChef Public Profile Scraper

Why Playwright:
- CodeChef profile pages use JavaScript for rendering stats
- Public profile data includes rating, stars, problems solved
- We extract only publicly visible information

Safety measures:
- Headless mode only
- Rate limited (3+ seconds between requests)
- No authentication or login bypass
- User-agent mimics real browser
"""

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from typing import Dict, Any
import asyncio
import re


class CodeChefScraperError(Exception):
    """Custom exception for CodeChef scraper errors"""
    pass


class CodeChefScraper:
    """
    CodeChef Public Profile Scraper using Playwright
    
    Extracts:
    - Current rating
    - Stars rating (1-7 stars)
    - Global/Country rank
    - Problems solved
    - Contests participated
    """
    
    CODECHEF_PROFILE_URL = "https://www.codechef.com/users/{username}"
    
    # Rate limit delay in seconds
    RATE_LIMIT_DELAY = 3.0
    
    def __init__(self):
        self._last_request_time = 0
        self._playwright = None
        self._browser = None
    
    async def _init_browser(self):
        """Initialize Playwright browser if not already running"""
        if self._browser is None:
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.firefox.launch(
                headless=True
            )
    
    async def _rate_limit(self):
        """Enforce rate limiting between requests"""
        current_time = asyncio.get_event_loop().time()
        time_since_last = current_time - self._last_request_time
        if time_since_last < self.RATE_LIMIT_DELAY:
            await asyncio.sleep(self.RATE_LIMIT_DELAY - time_since_last)
        self._last_request_time = asyncio.get_event_loop().time()
    
    async def scrape_profile(self, username: str) -> Dict[str, Any]:
        """
        Scrape a CodeChef public profile page
        
        Args:
            username: CodeChef username
            
        Returns:
            Dict with rating, stars, and problem stats
        """
        await self._rate_limit()
        await self._init_browser()
        
        url = self.CODECHEF_PROFILE_URL.format(username=username)
        context = None
        page = None
        
        try:
            context = await self._browser.new_context(
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080}
            )
            page = await context.new_page()
            
            # Navigate to profile
            response = await page.goto(url, wait_until='networkidle', timeout=30000)
            
            if response and response.status == 404:
                raise CodeChefScraperError(f"User '{username}' not found on CodeChef")
            
            # Wait for profile content to load
            await page.wait_for_timeout(2000)
            
            # Check if profile exists
            not_found = await page.query_selector('text="User not found"')
            if not_found:
                raise CodeChefScraperError(f"User '{username}' not found on CodeChef")
            
            # Extract statistics
            stats = await self._extract_stats(page, username)
            return stats
            
        except PlaywrightTimeout:
            raise CodeChefScraperError(f"Timeout loading profile for '{username}'")
        except Exception as e:
            if isinstance(e, CodeChefScraperError):
                raise
            raise CodeChefScraperError(f"Failed to scrape profile: {str(e)}")
        finally:
            if page:
                await page.close()
            if context:
                await context.close()
    
    async def _extract_stats(self, page, username: str) -> Dict[str, Any]:
        """Extract statistics from the loaded profile page"""
        
        result = {
            "platform": "codechef",
            "username": username,
            "currentRating": 0,
            "highestRating": 0,
            "stars": 0,
            "globalRank": None,
            "countryRank": None,
            "problemsSolved": 0,
            "contests": 0,
            "division": None
        }
        
        try:
            content = await page.content()
            
            # Extract current rating
            rating_match = re.search(r'rating["\s:]+(\d+)', content, re.IGNORECASE)
            if rating_match:
                result["currentRating"] = int(rating_match.group(1))
            
            # Extract highest rating
            highest_match = re.search(r'highest\s*rating["\s:]+(\d+)', content, re.IGNORECASE)
            if highest_match:
                result["highestRating"] = int(highest_match.group(1))
            
            # Extract stars (1-7)
            stars_match = re.search(r'(\d)\s*★|(\d)\s*star', content, re.IGNORECASE)
            if stars_match:
                result["stars"] = int(stars_match.group(1) or stars_match.group(2))
            
            # Alternative: Calculate stars from rating
            if result["stars"] == 0 and result["currentRating"] > 0:
                result["stars"] = self._calculate_stars(result["currentRating"])
            
            # Extract global rank
            global_rank_match = re.search(r'global\s*rank["\s:]+(\d+)', content, re.IGNORECASE)
            if global_rank_match:
                result["globalRank"] = int(global_rank_match.group(1))
            
            # Extract country rank
            country_rank_match = re.search(r'country\s*rank["\s:]+(\d+)', content, re.IGNORECASE)
            if country_rank_match:
                result["countryRank"] = int(country_rank_match.group(1))
            
            # Extract problems solved
            problems_match = re.search(r'problems?\s*solved["\s:]+(\d+)', content, re.IGNORECASE)
            if not problems_match:
                problems_match = re.search(r'fully\s*solved["\s:]+(\d+)', content, re.IGNORECASE)
            if problems_match:
                result["problemsSolved"] = int(problems_match.group(1))
            
            # Extract contest count
            contests_match = re.search(r'contests?\s*participated["\s:]+(\d+)', content, re.IGNORECASE)
            if not contests_match:
                contests_match = re.search(r'contest[s]?["\s:]+(\d+)', content, re.IGNORECASE)
            if contests_match:
                result["contests"] = int(contests_match.group(1))
            
            # Try element-based extraction as fallback
            await self._try_extract_from_elements(page, result)
            
        except Exception as e:
            print(f"Warning: Partial extraction for {username}: {str(e)}")
        
        return result
    
    def _calculate_stars(self, rating: int) -> int:
        """Calculate CodeChef stars from rating"""
        if rating >= 2500:
            return 7
        elif rating >= 2200:
            return 6
        elif rating >= 2000:
            return 5
        elif rating >= 1800:
            return 4
        elif rating >= 1600:
            return 3
        elif rating >= 1400:
            return 2
        else:
            return 1
    
    async def _try_extract_from_elements(self, page, result: Dict[str, Any]):
        """Try to extract data from specific DOM elements"""
        try:
            # Look for rating elements
            rating_elements = await page.query_selector_all('[class*="rating"], [class*="Rating"]')
            for element in rating_elements:
                text = await element.inner_text()
                match = re.search(r'(\d{3,4})', text)
                if match and result["currentRating"] == 0:
                    result["currentRating"] = int(match.group(1))
                    break
            
            # Look for problem count
            problem_elements = await page.query_selector_all('[class*="problem"], h5, h4')
            for element in problem_elements:
                text = await element.inner_text()
                if 'solved' in text.lower() or 'problem' in text.lower():
                    match = re.search(r'(\d+)', text)
                    if match and result["problemsSolved"] == 0:
                        result["problemsSolved"] = int(match.group(1))
                        break
                        
        except Exception:
            pass
    
    async def close(self):
        """Close the browser and playwright instance"""
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None


# Convenience function for one-off usage
async def fetch_codechef_stats(username: str) -> Dict[str, Any]:
    """
    Fetch CodeChef stats for a user
    
    Usage:
        stats = await fetch_codechef_stats("codechef_username")
    """
    scraper = CodeChefScraper()
    try:
        return await scraper.scrape_profile(username)
    finally:
        await scraper.close()
