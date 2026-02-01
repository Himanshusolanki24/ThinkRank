"""
LeetCode Public Profile Scraper

Why Playwright:
- LeetCode profile pages are JavaScript-rendered SPAs
- Simple HTTP requests return empty shells without data
- Playwright loads the full page with JS execution
- We only access publicly visible profile data

Safety measures:
- Headless mode only (no visible browser)
- 2+ second delay between requests
- Only extracts publicly visible data
- User-agent mimics real browser
- No authentication or login bypass
"""

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from typing import Dict, Any, Optional
import asyncio
import re


class LeetCodeScraperError(Exception):
    """Custom exception for LeetCode scraper errors"""
    pass


class LeetCodeScraper:
    """
    LeetCode Public Profile Scraper using Playwright
    
    Extracts:
    - Total problems solved
    - Easy/Medium/Hard breakdown
    - Ranking (if available)
    - Acceptance rate
    """
    
    LEETCODE_PROFILE_URL = "https://leetcode.com/{username}/"
    
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
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
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
        Scrape a LeetCode public profile page
        
        Args:
            username: LeetCode username
            
        Returns:
            Dict with solved counts and stats
        """
        await self._rate_limit()
        await self._init_browser()
        
        url = self.LEETCODE_PROFILE_URL.format(username=username)
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
                raise LeetCodeScraperError(f"User '{username}' not found on LeetCode")
            
            # Wait for profile content to load
            await page.wait_for_timeout(2000)  # Additional wait for JS rendering
            
            # Check if profile exists
            not_found = await page.query_selector('text="Sorry, user not found"')
            if not_found:
                raise LeetCodeScraperError(f"User '{username}' not found on LeetCode")
            
            # Extract statistics
            stats = await self._extract_stats(page, username)
            return stats
            
        except PlaywrightTimeout:
            raise LeetCodeScraperError(f"Timeout loading profile for '{username}'")
        except Exception as e:
            if isinstance(e, LeetCodeScraperError):
                raise
            raise LeetCodeScraperError(f"Failed to scrape profile: {str(e)}")
        finally:
            if page:
                await page.close()
            if context:
                await context.close()
    
    async def _extract_stats(self, page, username: str) -> Dict[str, Any]:
        """Extract statistics from the loaded profile page"""
        
        result = {
            "platform": "leetcode",
            "username": username,
            "totalSolved": 0,
            "easySolved": 0,
            "mediumSolved": 0,
            "hardSolved": 0,
            "easyTotal": 0,
            "mediumTotal": 0,
            "hardTotal": 0,
            "ranking": None,
            "acceptanceRate": None,
            "contributionPoints": None
        }
        
        try:
            # Try to find the solved count display
            # LeetCode uses various selectors; we try multiple approaches
            
            # Method 1: Look for the circular progress indicators
            solved_elements = await page.query_selector_all('[class*="CircularProgressBar"] + span, [class*="progress"] ~ div')
            
            # Method 2: Look for text patterns like "X/Y Solved"
            content = await page.content()
            
            # Extract total solved count
            total_match = re.search(r'(\d+)\s*/\s*\d+\s*Solved', content)
            if total_match:
                result["totalSolved"] = int(total_match.group(1))
            
            # Alternative: Look for specific difficulty sections
            # Easy problems
            easy_match = re.search(r'Easy[^>]*>.*?(\d+)\s*/\s*(\d+)', content, re.DOTALL | re.IGNORECASE)
            if easy_match:
                result["easySolved"] = int(easy_match.group(1))
                result["easyTotal"] = int(easy_match.group(2))
            
            # Medium problems
            medium_match = re.search(r'Medium[^>]*>.*?(\d+)\s*/\s*(\d+)', content, re.DOTALL | re.IGNORECASE)
            if medium_match:
                result["mediumSolved"] = int(medium_match.group(1))
                result["mediumTotal"] = int(medium_match.group(2))
            
            # Hard problems
            hard_match = re.search(r'Hard[^>]*>.*?(\d+)\s*/\s*(\d+)', content, re.DOTALL | re.IGNORECASE)
            if hard_match:
                result["hardSolved"] = int(hard_match.group(1))
                result["hardTotal"] = int(hard_match.group(2))
            
            # Calculate total if not found directly
            if result["totalSolved"] == 0:
                result["totalSolved"] = result["easySolved"] + result["mediumSolved"] + result["hardSolved"]
            
            # Extract ranking
            ranking_match = re.search(r'Ranking[^>]*>.*?(\d[\d,]+)', content, re.DOTALL | re.IGNORECASE)
            if ranking_match:
                result["ranking"] = int(ranking_match.group(1).replace(',', ''))
            
            # Alternative method: Query specific elements if available
            # This handles LeetCode's newer UI
            await self._try_extract_from_elements(page, result)
            
        except Exception as e:
            # Log but don't fail - return partial data
            print(f"Warning: Partial extraction for {username}: {str(e)}")
        
        return result
    
    async def _try_extract_from_elements(self, page, result: Dict[str, Any]):
        """Try to extract data from specific DOM elements"""
        try:
            # Look for difficulty-specific solved counts using data attributes or specific classes
            difficulty_elements = await page.query_selector_all('[data-difficulty], .difficulty-level')
            
            for element in difficulty_elements:
                text = await element.inner_text()
                difficulty = await element.get_attribute('data-difficulty')
                
                if difficulty or 'easy' in text.lower():
                    match = re.search(r'(\d+)', text)
                    if match:
                        result["easySolved"] = int(match.group(1))
                elif 'medium' in text.lower():
                    match = re.search(r'(\d+)', text)
                    if match:
                        result["mediumSolved"] = int(match.group(1))
                elif 'hard' in text.lower():
                    match = re.search(r'(\d+)', text)
                    if match:
                        result["hardSolved"] = int(match.group(1))
            
            # Try to find total solved from a progress element
            progress_elements = await page.query_selector_all('[class*="solved"], [class*="progress-text"]')
            for element in progress_elements:
                text = await element.inner_text()
                match = re.search(r'(\d+)\s*/\s*\d+', text)
                if match:
                    result["totalSolved"] = int(match.group(1))
                    break
                    
        except Exception:
            pass  # Silently continue with existing data
    
    async def close(self):
        """Close the browser and playwright instance"""
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None


# Convenience function for one-off usage
async def fetch_leetcode_stats(username: str) -> Dict[str, Any]:
    """
    Fetch LeetCode stats for a user
    
    Usage:
        stats = await fetch_leetcode_stats("leetcode_username")
    """
    scraper = LeetCodeScraper()
    try:
        return await scraper.scrape_profile(username)
    finally:
        await scraper.close()
