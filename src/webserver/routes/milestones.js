import { Router } from 'express';
import { SubmissionService } from '#services/submissionService.js';
import logger from '#utils/logger.js';

const router = Router();

function getAdjustedDayString(date) {
  const utc = new Date(date);
  const hours = utc.getUTCHours();

  // If before 4:00 UTC, count it as the previous "day"
  if (hours < 4) {
    utc.setUTCDate(utc.getUTCDate() - 1);
  }

  return `${utc.getUTCFullYear()}-${(utc.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-${utc.getUTCDate().toString().padStart(2, '0')}`;
}

router.get('/milestones', async (_, res) => {
  try {
    const submissions = await SubmissionService.getApprovedSubmissions();

    // Map to store: day => teamId => total
    const dayTeamMap = new Map();
    // Map to store cumulative totals per team
    const cumulativeTeamTotals = new Map();
    let cumulativeOverall = 0;

    for (const sub of submissions) {
      const day = getAdjustedDayString(sub.createdAt);
      const teamId = sub.team.id;
      const teamName = sub.team.name;
      const valueNum = Number(sub.value) || 0;

      if (!dayTeamMap.has(day)) {
        dayTeamMap.set(day, new Map());
      }

      const teamMap = dayTeamMap.get(day);

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
    const sortedDays = Array.from(dayTeamMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    const milestones = sortedDays.map(([day, teamMap]) => {
      let dayTotal = 0;

      // Build teams array with cumulative totals
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
        day,
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
