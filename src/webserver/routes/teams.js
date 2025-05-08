import { Router } from 'express';
import { EventService } from '#services/eventService.js';
import logger from '#utils/logger.js';

const router = Router();

router.get('/teams', async (req, res) => {
  try {
    const teams = await EventService.getActiveEventTeams();
    if (!teams) {
      return res.status(404).json({ error: 'No teams found for the active event' });
    }
    const formatted = teams.map((team) => {
      let teamTotal = 0;

      const members = team.members.map((member) => {
        const { user } = member;
        const approvedSubmissions = user.submissions.filter((s) => s.status === 'APPROVED');

        const submissionTotal = approvedSubmissions.reduce((sum, sub) => {
          return sum + parseInt(sub.value, 10);
        }, 0);

        teamTotal += submissionTotal;

        return {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          rsn: member.user.events[0]?.rsn || null,
          duo: member.user.events[0]?.note || null,
          submissionTotal,
        };
      });

      return {
        id: team.id,
        name: team.name,
        teamTotal,
        members,
      };
    });
    res.status(200).json(formatted);
  } catch (error) {
    logger.error('Error fetching teams: ' + error);
    res.status(500).json({ error: 'Failed to fetch teams.', details: error.message });
  }
});

export default router;
