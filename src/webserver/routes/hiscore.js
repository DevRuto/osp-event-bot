import { Router } from 'express';
import { HiscoreService } from '#services/hiscoreService.js';
import logger from '#utils/logger.js';

const router = Router();

router.get('/hiscore', async (_, res) => {
  try {
    const hiscore = await HiscoreService.loadHiscore();
    if (!hiscore) {
      return res.status(500).json({ error: 'Failed to fetch hiscores' });
    }
    res.json(hiscore);
  } catch (error) {
    logger.error('Error fetching hiscores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
