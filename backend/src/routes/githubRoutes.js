const express = require('express');
const { analyzeSkillGenome } = require('../services/skillGenomeService');

const router = express.Router();

/**
 * POST /api/github/skill-genome
 * Analyze skill genome for a GitHub username
 */
router.post('/skill-genome', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'GitHub username is required'
            });
        }

        console.log(`Skill Genome analysis requested for: ${username}`);

        const result = await analyzeSkillGenome(username);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Skill Genome API error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze skill genome'
        });
    }
});

module.exports = router;
