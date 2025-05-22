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

function getHourBucket(date) {
  const msPerHour = 60 * 60 * 1000;
  return Math.floor((new Date(date) - EVENT_START) / msPerHour);
}

router.get('/milestones', async (_, res) => {
  try {
    const submissions = await SubmissionService.getApprovedSubmissions();

    const dayTeamMap = new Map(); // day => teamId => { teamName, dailyTotal }
    const hourlyTeamMap = new Map(); // hour => teamId => hourlyTotal
    const cumulativeTeamTotals = new Map(); // teamId => cumulative
    let cumulativeOverall = 0;

    for (const sub of submissions) {
      const dayBucket = getDayBucket(sub.createdAt);
      const hourBucket = getHourBucket(sub.createdAt);
      const teamId = sub.team.id;
      const teamName = sub.team.name;
      const valueNum = Number(sub.value) || 0;

      // Daily totals
      if (!dayTeamMap.has(dayBucket)) {
        dayTeamMap.set(dayBucket, new Map());
      }
      const teamMap = dayTeamMap.get(dayBucket);
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, { teamName, dailyTotal: 0 });
      }
      teamMap.get(teamId).dailyTotal += valueNum;

      // Hourly totals
      if (!hourlyTeamMap.has(hourBucket)) {
        hourlyTeamMap.set(hourBucket, new Map());
      }
      const hourTeamMap = hourlyTeamMap.get(hourBucket);
      hourTeamMap.set(teamId, (hourTeamMap.get(teamId) || 0) + valueNum);
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

        // Hourly breakdown for this day
        const startHour = dayIndex * 24;
        const hourlyBreakdown = Array.from({ length: 24 }, (_, h) => {
          const hourIndex = startHour + h;
          const hourMap = hourlyTeamMap.get(hourIndex);
          return hourMap?.get(teamId) || 0;
        });

        return {
          teamId,
          teamName,
          dailyTotal,
          cumulativeTotal,
          hourlyBreakdown,
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
