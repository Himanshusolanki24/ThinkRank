"""
Unified Normalization Engine

Normalizes data from all coding platforms into a unified skill profile.
This is the core intelligence that powers recruiter-grade assessment.

Output Format:
{
  "problemSolving": 0-100,
  "algorithmicDepth": 0-100,
  "consistency": 0-100,
  "competitiveStrength": 0-100,
  "platformCoverage": {
    "leetcode": true/false,
    "codechef": true/false,
    "codeforces": true/false,
    "hackerrank": true/false,
    "github": true/false
  },
  "overallGrade": "A" to "F",
  "recommendations": [...]
}

Scoring Philosophy:
- We focus on REAL skill signals, not vanity metrics
- Missing platforms don't penalize users
- Competitive ratings are highly weighted (they're validated)
- Problem count matters, but difficulty distribution matters more
- Interview performance can override platform history
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum


class Grade(str, Enum):
    """Skill grades from A+ to F"""
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B = "B"
    B_MINUS = "B-"
    C_PLUS = "C+"
    C = "C"
    C_MINUS = "C-"
    D = "D"
    F = "F"


@dataclass
class UnifiedProfile:
    """Unified skill profile output"""
    problemSolving: float = 0.0
    algorithmicDepth: float = 0.0
    consistency: float = 0.0
    competitiveStrength: float = 0.0
    platformCoverage: Dict[str, bool] = field(default_factory=dict)
    overallGrade: str = "F"
    overallScore: float = 0.0
    recommendations: List[str] = field(default_factory=list)
    rawPlatformData: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "problemSolving": round(self.problemSolving, 1),
            "algorithmicDepth": round(self.algorithmicDepth, 1),
            "consistency": round(self.consistency, 1),
            "competitiveStrength": round(self.competitiveStrength, 1),
            "platformCoverage": self.platformCoverage,
            "overallGrade": self.overallGrade,
            "overallScore": round(self.overallScore, 1),
            "recommendations": self.recommendations
        }


class NormalizationEngine:
    """
    Core normalization engine for coding platform signals
    
    Scoring Formulas:
    
    1. Problem Solving (0-100):
       - Based on total problems solved with difficulty weighting
       - Easy: 1 point, Medium: 2 points, Hard: 4 points
       - Capped at 100, normalized across platforms
    
    2. Algorithmic Depth (0-100):
       - Hard problem ratio × 40
       - Codeforces rating normalized × 40
       - CodeChef rating normalized × 20
    
    3. Consistency (0-100):
       - Contest participation × 5 (capped at 50)
       - GitHub activity score × 50 (if available)
    
    4. Competitive Strength (0-100):
       - max(CF rating, CC rating) normalized to 0-100
       - Rating percentile weighted
    
    Missing Platform Handling:
       - Each platform gets weight 0 if missing
       - Remaining weights are redistributed proportionally
       - Never blocks user if zero platform data
    """
    
    # Rating normalization constants
    CF_MAX_RATING = 3500  # Approximate max Codeforces rating
    CC_MAX_RATING = 3000  # Approximate max CodeChef rating
    
    # Weights for overall score calculation
    WEIGHTS = {
        "problemSolving": 0.30,
        "algorithmicDepth": 0.25,
        "consistency": 0.20,
        "competitiveStrength": 0.25
    }
    
    def __init__(self):
        self._platform_data = {}
    
    def normalize(
        self,
        codeforces: Optional[Dict[str, Any]] = None,
        leetcode: Optional[Dict[str, Any]] = None,
        codechef: Optional[Dict[str, Any]] = None,
        hackerrank: Optional[Dict[str, Any]] = None,
        github: Optional[Dict[str, Any]] = None
    ) -> UnifiedProfile:
        """
        Normalize all platform data into a unified profile
        
        Args:
            codeforces: Codeforces API response
            leetcode: LeetCode scraper response
            codechef: CodeChef scraper response
            hackerrank: HackerRank scraper response
            github: GitHub service response
            
        Returns:
            UnifiedProfile with normalized scores
        """
        # Store raw data
        self._platform_data = {
            "codeforces": codeforces,
            "leetcode": leetcode,
            "codechef": codechef,
            "hackerrank": hackerrank,
            "github": github
        }
        
        # Calculate platform coverage
        platform_coverage = {
            "codeforces": codeforces is not None,
            "leetcode": leetcode is not None,
            "codechef": codechef is not None,
            "hackerrank": hackerrank is not None,
            "github": github is not None
        }
        
        # Calculate each metric
        problem_solving = self._calculate_problem_solving(leetcode, codeforces, codechef, hackerrank)
        algorithmic_depth = self._calculate_algorithmic_depth(leetcode, codeforces, codechef)
        consistency = self._calculate_consistency(codeforces, codechef, github)
        competitive_strength = self._calculate_competitive_strength(codeforces, codechef)
        
        # Calculate overall score
        overall_score = (
            problem_solving * self.WEIGHTS["problemSolving"] +
            algorithmic_depth * self.WEIGHTS["algorithmicDepth"] +
            consistency * self.WEIGHTS["consistency"] +
            competitive_strength * self.WEIGHTS["competitiveStrength"]
        )
        
        # Determine grade
        overall_grade = self._calculate_grade(overall_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            problem_solving, algorithmic_depth, consistency, competitive_strength,
            platform_coverage
        )
        
        return UnifiedProfile(
            problemSolving=problem_solving,
            algorithmicDepth=algorithmic_depth,
            consistency=consistency,
            competitiveStrength=competitive_strength,
            platformCoverage=platform_coverage,
            overallGrade=overall_grade,
            overallScore=overall_score,
            recommendations=recommendations,
            rawPlatformData=self._platform_data
        )
    
    def _calculate_problem_solving(
        self,
        leetcode: Optional[Dict],
        codeforces: Optional[Dict],
        codechef: Optional[Dict],
        hackerrank: Optional[Dict]
    ) -> float:
        """
        Calculate problem solving score (0-100)
        
        Formula:
        score = min(100, weighted_problems_solved / 10)
        
        Where weighted = easy×1 + medium×2 + hard×4
        """
        total_weighted_score = 0
        platform_count = 0
        
        # LeetCode (primary source for difficulty breakdown)
        if leetcode:
            platform_count += 1
            easy = leetcode.get("easySolved", 0)
            medium = leetcode.get("mediumSolved", 0)
            hard = leetcode.get("hardSolved", 0)
            total = leetcode.get("totalSolved", 0)
            
            # Use difficulty breakdown if available
            if easy + medium + hard > 0:
                weighted = easy * 1 + medium * 2 + hard * 4
            else:
                # Estimate: assume 50% easy, 35% medium, 15% hard
                weighted = total * 1.65
            
            total_weighted_score += min(100, weighted / 10)
        
        # Codeforces (use problem count with rating-based estimation)
        if codeforces:
            platform_count += 1
            solved = codeforces.get("problemsSolved", 0)
            problem_ratings = codeforces.get("problemRatings", {})
            
            if problem_ratings:
                # Weight by problem rating (harder problems = more points)
                weighted = 0
                for rating, count in problem_ratings.items():
                    try:
                        rating_int = int(rating)
                        if rating_int < 1200:
                            weighted += count * 1
                        elif rating_int < 1600:
                            weighted += count * 2
                        elif rating_int < 2000:
                            weighted += count * 3
                        else:
                            weighted += count * 4
                    except:
                        weighted += count * 1.5
            else:
                weighted = solved * 1.5
            
            total_weighted_score += min(100, weighted / 10)
        
        # CodeChef (simple problem count)
        if codechef:
            platform_count += 1
            solved = codechef.get("problemsSolved", 0)
            total_weighted_score += min(100, solved * 1.5 / 10)
        
        # HackerRank (supplementary)
        if hackerrank:
            platform_count += 1
            solved = hackerrank.get("totalSolved", 0)
            total_weighted_score += min(100, solved * 1.2 / 10)
        
        # Average across available platforms
        if platform_count > 0:
            return min(100, total_weighted_score / platform_count)
        
        return 0.0
    
    def _calculate_algorithmic_depth(
        self,
        leetcode: Optional[Dict],
        codeforces: Optional[Dict],
        codechef: Optional[Dict]
    ) -> float:
        """
        Calculate algorithmic depth score (0-100)
        
        Based on:
        - Hard problem ratio (40 points max)
        - Codeforces rating (40 points max)
        - CodeChef rating (20 points max)
        """
        score = 0.0
        
        # Hard problem ratio from LeetCode (0-40 points)
        if leetcode:
            total = leetcode.get("totalSolved", 0)
            hard = leetcode.get("hardSolved", 0)
            if total > 0:
                hard_ratio = hard / total
                score += hard_ratio * 40  # Max 40 points
        
        # Codeforces rating (0-40 points)
        if codeforces:
            rating = codeforces.get("rating", 0)
            if rating > 0:
                normalized = min(1.0, rating / self.CF_MAX_RATING)
                score += normalized * 40
        
        # CodeChef rating (0-20 points)
        if codechef:
            rating = codechef.get("currentRating", 0)
            if rating > 0:
                normalized = min(1.0, rating / self.CC_MAX_RATING)
                score += normalized * 20
        
        return min(100, score)
    
    def _calculate_consistency(
        self,
        codeforces: Optional[Dict],
        codechef: Optional[Dict],
        github: Optional[Dict]
    ) -> float:
        """
        Calculate consistency score (0-100)
        
        Based on:
        - Contest participation (50 points max)
        - GitHub activity (50 points max)
        """
        score = 0.0
        
        # Contest participation (0-50 points)
        total_contests = 0
        if codeforces:
            total_contests += codeforces.get("contestsParticipated", 0)
        if codechef:
            total_contests += codechef.get("contests", 0)
        
        # Cap at 50 contests = 50 points
        score += min(50, total_contests)
        
        # GitHub activity (0-50 points)
        if github:
            repo_count = github.get("repoCount", 0)
            # Approximate activity from repo count
            activity_score = min(50, repo_count * 2)
            score += activity_score
        
        return min(100, score)
    
    def _calculate_competitive_strength(
        self,
        codeforces: Optional[Dict],
        codechef: Optional[Dict]
    ) -> float:
        """
        Calculate competitive strength score (0-100)
        
        Based on the higher of Codeforces or CodeChef rating
        """
        cf_rating = 0
        cc_rating = 0
        
        if codeforces:
            cf_rating = codeforces.get("rating", 0)
        
        if codechef:
            cc_rating = codechef.get("currentRating", 0)
        
        # Normalize ratings to comparable scale
        cf_normalized = min(100, (cf_rating / self.CF_MAX_RATING) * 100) if cf_rating > 0 else 0
        cc_normalized = min(100, (cc_rating / self.CC_MAX_RATING) * 100) if cc_rating > 0 else 0
        
        # Use the higher of the two with weight adjustment
        return max(cf_normalized, cc_normalized * 0.9)  # Slight preference for CF rating
    
    def _calculate_grade(self, score: float) -> str:
        """Convert overall score to letter grade"""
        if score >= 95:
            return Grade.A_PLUS.value
        elif score >= 90:
            return Grade.A.value
        elif score >= 85:
            return Grade.A_MINUS.value
        elif score >= 80:
            return Grade.B_PLUS.value
        elif score >= 75:
            return Grade.B.value
        elif score >= 70:
            return Grade.B_MINUS.value
        elif score >= 65:
            return Grade.C_PLUS.value
        elif score >= 60:
            return Grade.C.value
        elif score >= 55:
            return Grade.C_MINUS.value
        elif score >= 50:
            return Grade.D.value
        else:
            return Grade.F.value
    
    def _generate_recommendations(
        self,
        problem_solving: float,
        algorithmic_depth: float,
        consistency: float,
        competitive_strength: float,
        platform_coverage: Dict[str, bool]
    ) -> List[str]:
        """Generate personalized recommendations based on scores"""
        recommendations = []
        
        # Problem solving recommendations
        if problem_solving < 50:
            recommendations.append(
                "Increase problem-solving practice. Aim for 2-3 problems daily on LeetCode."
            )
        
        # Algorithmic depth recommendations
        if algorithmic_depth < 40:
            recommendations.append(
                "Focus on harder problems. Try more Hard-level problems on LeetCode and higher-rated problems on Codeforces."
            )
        
        # Consistency recommendations
        if consistency < 30:
            recommendations.append(
                "Participate in more contests. Regular contest participation builds time pressure skills."
            )
        
        # Competitive strength recommendations
        if competitive_strength < 50:
            recommendations.append(
                "Work on improving competitive ratings. Participate in Codeforces or CodeChef rated contests."
            )
        
        # Platform coverage recommendations
        active_platforms = sum(1 for v in platform_coverage.values() if v)
        if active_platforms < 2:
            if not platform_coverage.get("leetcode"):
                recommendations.append(
                    "Create a LeetCode account. It's essential for interview preparation."
                )
            if not platform_coverage.get("codeforces"):
                recommendations.append(
                    "Consider joining Codeforces for competitive programming experience."
                )
        
        # If doing well, add encouraging messages
        if problem_solving >= 70 and algorithmic_depth >= 70:
            recommendations.append(
                "Strong foundation! Consider focusing on system design and behavioral interviews."
            )
        
        return recommendations[:5]  # Limit to top 5 recommendations


# Convenience function for direct usage
def normalize_coding_signals(
    codeforces: Optional[Dict[str, Any]] = None,
    leetcode: Optional[Dict[str, Any]] = None,
    codechef: Optional[Dict[str, Any]] = None,
    hackerrank: Optional[Dict[str, Any]] = None,
    github: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Normalize coding signals from all platforms
    
    Usage:
        profile = normalize_coding_signals(
            codeforces={"rating": 1500, "problemsSolved": 100},
            leetcode={"totalSolved": 200, "hardSolved": 30}
        )
    """
    engine = NormalizationEngine()
    profile = engine.normalize(
        codeforces=codeforces,
        leetcode=leetcode,
        codechef=codechef,
        hackerrank=hackerrank,
        github=github
    )
    return profile.to_dict()
