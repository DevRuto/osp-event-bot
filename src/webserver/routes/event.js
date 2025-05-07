import { Router } from 'express';
import { EventService } from '#services/eventService.js';
import logger from '#utils/logger.js';

const router = Router();

router.get('/event', async (req, res) => {
  try {
    const event = await EventService.getActiveEvent();
    res.status(200).json(event);
  } catch (error) {
    logger.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants.', details: error.message });
  }
});

export default router;
