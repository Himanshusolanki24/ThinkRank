"""
Codeforces Official API Integration

Uses the official Codeforces REST API which is public and requires no authentication.
Documentation: https://codeforces.com/apiHelp

Endpoints used:
- user.info: Get basic user information (rating, rank, etc.)
- user.rating: Get rating change history
- user.status: Get submission history for problem statistics
"""

import httpx
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from datetime import datetime
import asyncio

# API Base URL
CODEFORCES_API_BASE = "https://codeforces.com/api"

# Rate limit: 1 request per 2 seconds to be safe
RATE_LIMIT_DELAY = 2.0


@dataclass
class CodeforcesUserInfo:
    """Parsed Codeforces user information"""
    handle: str
    rating: int
    max_rating: int
    rank: str
    max_rank: str
    contribution: int
    friend_of_count: int
    registration_time: datetime
    avatar: Optional[str] = None


@dataclass
class CodeforcesStats:
    """Complete Codeforces statistics for a user"""
    user_info: CodeforcesUserInfo
    contests_participated: int
    problems_solved: int
    problem_ratings: Dict[str, int]  # rating -> count
    recent_contests: List[Dict[str, Any]]
    

class CodeforcesAPIError(Exception):
    """Custom exception for Codeforces API errors"""
    pass


class CodeforcesAPI:
    """
    Official Codeforces API Client
    
    Why this approach:
    - Codeforces has a fully public REST API
    - No authentication required for public data
    - Rate limited to 1 request per 2 seconds (we use 2s delay)
    - Returns JSON with well-documented structure
    """
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self._last_request_time = 0
    
    async def _rate_limit(self):
        """Enforce rate limiting between requests"""
        current_time = asyncio.get_event_loop().time()
        time_since_last = current_time - self._last_request_time
        if time_since_last < RATE_LIMIT_DELAY:
            await asyncio.sleep(RATE_LIMIT_DELAY - time_since_last)
        self._last_request_time = asyncio.get_event_loop().time()
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make a rate-limited request to Codeforces API"""
        await self._rate_limit()
        
        url = f"{CODEFORCES_API_BASE}/{endpoint}"
        try:
            response = await self.client.get(url, params=params or {})
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") != "OK":
                comment = data.get("comment", "Unknown error")
                raise CodeforcesAPIError(f"API Error: {comment}")
            
            return data.get("result")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 400:
                # Usually means user not found
                raise CodeforcesAPIError(f"User not found or invalid request")
            raise CodeforcesAPIError(f"HTTP Error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise CodeforcesAPIError(f"Request failed: {str(e)}")
    
    async def get_user_info(self, handle: str) -> CodeforcesUserInfo:
        """
        Fetch user basic information
        
        API: https://codeforces.com/api/user.info?handles={handle}
        """
        result = await self._make_request("user.info", {"handles": handle})
        
        if not result or len(result) == 0:
            raise CodeforcesAPIError(f"User '{handle}' not found")
        
        user = result[0]
        
        return CodeforcesUserInfo(
            handle=user.get("handle", handle),
            rating=user.get("rating", 0),
            max_rating=user.get("maxRating", 0),
            rank=user.get("rank", "unrated"),
            max_rank=user.get("maxRank", "unrated"),
            contribution=user.get("contribution", 0),
            friend_of_count=user.get("friendOfCount", 0),
            registration_time=datetime.fromtimestamp(user.get("registrationTimeSeconds", 0)),
            avatar=user.get("avatar")
        )
    
    async def get_rating_history(self, handle: str) -> List[Dict[str, Any]]:
        """
        Fetch user's rating change history
        
        API: https://codeforces.com/api/user.rating?handle={handle}
        """
        try:
            result = await self._make_request("user.rating", {"handle": handle})
            return result or []
        except CodeforcesAPIError:
            # User might have no contest history
            return []
    
    async def get_submissions(self, handle: str, count: int = 1000) -> List[Dict[str, Any]]:
        """
        Fetch user's submission history
        
        API: https://codeforces.com/api/user.status?handle={handle}&from=1&count={count}
        
        We limit to 1000 submissions to avoid excessive data
        """
        try:
            result = await self._make_request("user.status", {
                "handle": handle,
                "from": 1,
                "count": count
            })
            return result or []
        except CodeforcesAPIError:
            return []
    
    async def get_full_stats(self, handle: str) -> Dict[str, Any]:
        """
        Get complete statistics for a user
        
        Returns structured JSON with all available data:
        - User info (rating, rank, etc.)
        - Contest participation count
        - Problems solved
        - Problem difficulty distribution
        """
        # Fetch all data in parallel (with rate limiting)
        user_info = await self.get_user_info(handle)
        rating_history = await self.get_rating_history(handle)
        submissions = await self.get_submissions(handle)
        
        # Calculate unique problems solved
        solved_problems = set()
        problem_ratings = {}
        
        for sub in submissions:
            if sub.get("verdict") == "OK":
                problem = sub.get("problem", {})
                problem_key = f"{problem.get('contestId', 0)}_{problem.get('index', '')}"
                
                if problem_key not in solved_problems:
                    solved_problems.add(problem_key)
                    
                    # Track problem ratings
                    rating = problem.get("rating", 0)
                    if rating > 0:
                        rating_bucket = str((rating // 200) * 200)  # Bucket into 200-point ranges
                        problem_ratings[rating_bucket] = problem_ratings.get(rating_bucket, 0) + 1
        
        # Get recent contests (last 10)
        recent_contests = []
        for contest in rating_history[-10:]:
            recent_contests.append({
                "contestId": contest.get("contestId"),
                "contestName": contest.get("contestName"),
                "rank": contest.get("rank"),
                "oldRating": contest.get("oldRating"),
                "newRating": contest.get("newRating"),
                "ratingChange": contest.get("newRating", 0) - contest.get("oldRating", 0)
            })
        
        return {
            "platform": "codeforces",
            "handle": user_info.handle,
            "rating": user_info.rating,
            "maxRating": user_info.max_rating,
            "rank": user_info.rank,
            "maxRank": user_info.max_rank,
            "contribution": user_info.contribution,
            "friendOfCount": user_info.friend_of_count,
            "registeredAt": user_info.registration_time.isoformat(),
            "avatar": user_info.avatar,
            "contestsParticipated": len(rating_history),
            "problemsSolved": len(solved_problems),
            "problemRatings": problem_ratings,
            "recentContests": recent_contests
        }
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Convenience function for one-off usage
async def fetch_codeforces_stats(handle: str) -> Dict[str, Any]:
    """
    Fetch complete Codeforces stats for a user
    
    Usage:
        stats = await fetch_codeforces_stats("tourist")
    """
    api = CodeforcesAPI()
    try:
        return await api.get_full_stats(handle)
    finally:
        await api.close()
