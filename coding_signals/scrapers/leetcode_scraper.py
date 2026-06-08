"""
LeetCode Public Profile Scraper (GraphQL API)

This scraper uses the public LeetCode GraphQL API to fetch user stats.
This is much faster and more reliable than scraping the UI using Playwright.
"""

import httpx
from typing import Dict, Any

class LeetCodeScraperError(Exception):
    """Custom exception for LeetCode scraper errors"""
    pass

class LeetCodeScraper:
    """
    LeetCode GraphQL Scraper
    """
    
    GRAPHQL_URL = "https://leetcode.com/graphql"
    
    async def scrape_profile(self, username: str) -> Dict[str, Any]:
        """
        Fetch LeetCode stats via GraphQL API
        """
        query = """
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
                ranking
                reputation
            }
          }
          userContestRanking(username: $username) {
            rating
            globalRanking
          }
        }
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.GRAPHQL_URL,
                    json={"query": query, "variables": {"username": username}},
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    raise LeetCodeScraperError(f"API request failed with status {response.status_code}")
                    
                data = response.json()
                
                if "errors" in data:
                    raise LeetCodeScraperError(f"User '{username}' not found on LeetCode")
                    
                if not data.get("data", {}).get("matchedUser"):
                    raise LeetCodeScraperError(f"User '{username}' not found on LeetCode")
                
                matched_user = data["data"]["matchedUser"]
                submissions = matched_user.get("submitStats", {}).get("acSubmissionNum", [])
                profile = matched_user.get("profile", {})
                
                result = {
                    "platform": "leetcode",
                    "username": username,
                    "totalSolved": 0,
                    "easySolved": 0,
                    "mediumSolved": 0,
                    "hardSolved": 0,
                    "easyTotal": 0,      # Note: total counts per difficulty are not returned by this specific query
                    "mediumTotal": 0,
                    "hardTotal": 0,
                    "ranking": profile.get("ranking"),
                    "acceptanceRate": None,
                    "contributionPoints": profile.get("reputation")
                }
                
                for sub in submissions:
                    diff = sub.get("difficulty")
                    count = sub.get("count", 0)
                    if diff == "All":
                        result["totalSolved"] = count
                    elif diff == "Easy":
                        result["easySolved"] = count
                    elif diff == "Medium":
                        result["mediumSolved"] = count
                    elif diff == "Hard":
                        result["hardSolved"] = count
                        
                return result
                
        except httpx.RequestError as e:
            raise LeetCodeScraperError(f"Failed to connect to LeetCode API: {str(e)}")
        except Exception as e:
            if isinstance(e, LeetCodeScraperError):
                raise
            raise LeetCodeScraperError(f"Failed to fetch profile: {str(e)}")
            
    async def close(self):
        # Kept for compatibility with main.py
        pass

async def fetch_leetcode_stats(username: str) -> Dict[str, Any]:
    scraper = LeetCodeScraper()
    return await scraper.scrape_profile(username)
