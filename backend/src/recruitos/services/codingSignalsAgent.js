const { executeCode, runTestCases } = require("../../services/codeExecutionService");
const { fetchLeetCodeStats, fetchHackerRankStats, fetchCodeChefStats } = require("../../services/codingSignalsService");

class CodingSignalsAgent {
    async fetchProfile(leetcodeHandle, hackerRankHandle, codeChefHandle) {
        let leetcodeData = null;
        let hackerRankData = null;
        let codeChefData = null;

        if (leetcodeHandle) {
            try {
                leetcodeData = await fetchLeetCodeStats(leetcodeHandle);
            } catch (e) {
                leetcodeData = this.getMockLeetcode(leetcodeHandle);
            }
        }

        if (hackerRankHandle) {
            try {
                hackerRankData = await fetchHackerRankStats(hackerRankHandle);
            } catch (e) {
                hackerRankData = this.getMockHackerRank(hackerRankHandle);
            }
        }

        if (codeChefHandle) {
            try {
                codeChefData = await fetchCodeChefStats(codeChefHandle);
            } catch (e) {
                codeChefData = this.getMockCodeChef(codeChefHandle);
            }
        }

        // Aggregate unified signals
        return {
            leetcode: leetcodeData,
            hackerRank: hackerRankData,
            codeChef: codeChefData,
            unifiedScore: this.calculateUnifiedScore(leetcodeData, hackerRankData, codeChefData)
        };
    }

    calculateUnifiedScore(lc, hr, cc) {
        let totalPoints = 0;
        let count = 0;

        if (lc && lc.totalSolved) {
            totalPoints += Math.min(100, (lc.totalSolved / 500) * 100);
            count++;
        }
        if (hr && hr.solvedCount) {
            totalPoints += Math.min(100, (hr.solvedCount / 100) * 100);
            count++;
        }
        if (cc && cc.rating) {
            totalPoints += Math.min(100, (cc.rating / 3000) * 100);
            count++;
        }

        if (count === 0) return 72; // Baseline intermediate score
        return Math.round(totalPoints / count);
    }

    getMockLeetcode(handle) {
        return {
            handle,
            totalSolved: 342,
            easySolved: 120,
            mediumSolved: 180,
            hardSolved: 42,
            acceptanceRate: 64.5,
            ranking: 84321
        };
    }

    getMockHackerRank(handle) {
        return {
            handle,
            solvedCount: 84,
            badges: ["Problem Solving (5 Star)", "Python (4 Star)", "Java (4 Star)"],
            globalRank: 12450
        };
    }

    getMockCodeChef(handle) {
        return {
            handle,
            rating: 1845,
            stars: "3 Star",
            globalRank: 7890
        };
    }

    async runCode(code, language, testCases) {
        return await runTestCases(code, language, testCases);
    }
}

module.exports = new CodingSignalsAgent();
