"""
HackerRank Public Profile Scraper

HackerRank is treated as a supplementary signal, not a primary source.
We extract badges and skill certifications if publicly available.

Safety measures:
- Headless mode only
- Rate limited
- No authentication or login bypass
- Public profile data only
"""

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from typing import Dict, Any, List
import asyncio
import re


class HackerRankScraperError(Exception):
    """Custom exception for HackerRank scraper errors"""
    pass


class HackerRankScraper:
    """
    HackerRank Public Profile Scraper
    
    Extracts:
    - Badges earned
    - Skill certifications
    - Language proficiencies (if visible)
    """
    
    HACKERRANK_PROFILE_URL = "https://www.hackerrank.com/profile/{username}"
    
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
        Scrape a HackerRank public profile page
        
        Args:
            username: HackerRank username
            
        Returns:
            Dict with badges and skills
        """
        await self._rate_limit()
        await self._init_browser()
        
        url = self.HACKERRANK_PROFILE_URL.format(username=username)
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
                raise HackerRankScraperError(f"User '{username}' not found on HackerRank")
            
            # Wait for profile content to load
            await page.wait_for_timeout(2000)
            
            # Check if profile exists
            not_found = await page.query_selector('text="Page not found"')
            if not_found:
                raise HackerRankScraperError(f"User '{username}' not found on HackerRank")
            
            # Extract statistics
            stats = await self._extract_stats(page, username)
            return stats
            
        except PlaywrightTimeout:
            raise HackerRankScraperError(f"Timeout loading profile for '{username}'")
        except Exception as e:
            if isinstance(e, HackerRankScraperError):
                raise
            raise HackerRankScraperError(f"Failed to scrape profile: {str(e)}")
        finally:
            if page:
                await page.close()
            if context:
                await context.close()
    
    async def _extract_stats(self, page, username: str) -> Dict[str, Any]:
        """Extract statistics from the loaded profile page"""
        
        result = {
            "platform": "hackerrank",
            "username": username,
            "badges": [],
            "skills": [],
            "certifications": [],
            "totalSolved": 0,
            "languageSkills": {}
        }
        
        try:
            content = await page.content()
            
            # Extract badges
            # Use specific class to avoid counting containers and UI sub-elements
            badge_elements = await page.query_selector_all('.hacker-badge')
            if not badge_elements:
                # Fallback to broader search if specific class fails, but exclude containers
                badge_elements = await page.query_selector_all('[class*="badge"]')
            
            for element in badge_elements:
                try:
                    class_attr = await element.get_attribute("class") or ""
                    # Skip containers and generic UI elements known to cause duplicates
                    if any(x in class_attr for x in ['wrap', 'list', 'container', 'section', 'progress', 'tracker']):
                        continue
                        
                    badge_text = await element.inner_text()
                    if badge_text and len(badge_text.strip()) > 0:
                        # Clean up text
                        clean_text = badge_text.split('\n')[0].strip()
                        if clean_text and clean_text != "Badges" and "Stars" not in clean_text:
                            result["badges"].append(clean_text)
                except:
                    pass
            
            # Extract certifications
            cert_elements = await page.query_selector_all('[class*="certificate"], [class*="Certificate"]')
            for element in cert_elements:
                try:
                    cert_text = await element.inner_text()
                    if cert_text and len(cert_text.strip()) > 0:
                        # Check for empty state messages
                        if "not earned" in cert_text.lower() or "get certified" in cert_text.lower():
                            continue
                        # Skip headers
                        if cert_text.strip() == "Certifications":
                            continue
                            
                        result["certifications"].append(cert_text.strip())
                except:
                    pass
            
            # Extract skills/languages
            skill_patterns = [
                r'Python\s*(\d+)\s*stars?',
                r'Java\s*(\d+)\s*stars?',
                r'C\+\+\s*(\d+)\s*stars?',
                r'JavaScript\s*(\d+)\s*stars?',
                r'SQL\s*(\d+)\s*stars?'
            ]
            
            for pattern in skill_patterns:
                match = re.search(pattern, content, re.IGNORECASE)
                if match:
                    skill_name = pattern.split('\\')[0]
                    result["languageSkills"][skill_name] = int(match.group(1))
            
            # Extract total solved problems
            solved_match = re.search(r'(\d+)\s*problems?\s*solved', content, re.IGNORECASE)
            if solved_match:
                result["totalSolved"] = int(solved_match.group(1))
            
            # Alternative: count from different sections
            await self._try_extract_from_elements(page, result)
            
        except Exception as e:
            print(f"Warning: Partial extraction for {username}: {str(e)}")
        
        return result
    
    async def _try_extract_from_elements(self, page, result: Dict[str, Any]):
        """Try to extract data from specific DOM elements"""
        try:
            # Look for skill cards or progress indicators
            skill_elements = await page.query_selector_all('[class*="skill-card"], [class*="progress"]')
            
            for element in skill_elements:
                text = await element.inner_text()
                # Check for skill names and stars
                if any(lang in text.lower() for lang in ['python', 'java', 'c++', 'javascript', 'sql']):
                    star_match = re.search(r'(\d)\s*(?:star|★)', text, re.IGNORECASE)
                    if star_match:
                        for lang in ['Python', 'Java', 'C++', 'JavaScript', 'SQL']:
                            if lang.lower() in text.lower():
                                result["languageSkills"][lang] = int(star_match.group(1))
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
async def fetch_hackerrank_stats(username: str) -> Dict[str, Any]:
    """
    Fetch HackerRank stats for a user
    
    Usage:
        stats = await fetch_hackerrank_stats("hackerrank_username")
    """
    scraper = HackerRankScraper()
    try:
        return await scraper.scrape_profile(username)
    finally:
        await scraper.close()
