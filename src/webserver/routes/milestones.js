import { Router } from 'express';
import { SubmissionService } from '#services/submissionService.js';
import logger from '#utils/logger.js';

const router = Router();

const EVENT_START = new Date('2025-05-16T16:00:00Z'); // First day at 12 PM EST

function getDayBucket(createdAt) {
  const submissionDate = new Date(createdAt);
  const diffMs = submissionDate - EVENT_START;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor(diffMs / msPerDay);
}

router.get('/milestones', async (_, res) => {
  try {
    const submissions = await SubmissionService.getApprovedSubmissions();

    // Map to store: dayBucket => teamId => total
    const dayTeamMap = new Map();
    // Map to store cumulative totals per team
    const cumulativeTeamTotals = new Map();
    let cumulativeOverall = 0;

    for (const sub of submissions) {
      const dayBucket = getDayBucket(sub.createdAt);
      const teamId = sub.team.id;
      const teamName = sub.team.name;
      const valueNum = Number(sub.value) || 0;

      if (!dayTeamMap.has(dayBucket)) {
        dayTeamMap.set(dayBucket, new Map());
      }

      const teamMap = dayTeamMap.get(dayBucket);

      if (teamMap.has(teamId)) {
        const existing = teamMap.get(teamId);
        teamMap.set(teamId, {
          teamName,
          dailyTotal: existing.dailyTotal + valueNum,
        });
      } else {
        teamMap.set(teamId, {
          teamName,
          dailyTotal: valueNum,
        });
      }
    }

    // Sort days ascending
    const sortedDays = Array.from(dayTeamMap.entries()).sort((a, b) => a[0] - b[0]);

    const milestones = sortedDays.map(([dayIndex, teamMap]) => {
      let dayTotal = 0;

      const teams = Array.from(teamMap.entries()).map(([teamId, { teamName, dailyTotal }]) => {
        const prevCumulative = cumulativeTeamTotals.get(teamId) || 0;
        const cumulativeTotal = prevCumulative + dailyTotal;
        cumulativeTeamTotals.set(teamId, cumulativeTotal);

        dayTotal += dailyTotal;

        return {
          teamId,
          teamName,
          dailyTotal,
          cumulativeTotal,
        };
      });

      cumulativeOverall += dayTotal;

      return {
        day: dayIndex, // This is an integer, can label in frontend as "Day {+1}"
        teams,
        dayTotal,
        cumulativeTotal: cumulativeOverall,
      };
    });

    res.json({ milestones });
  } catch (error) {
    logger.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
