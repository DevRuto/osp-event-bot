import { Router } from 'express';
import { OsrsPriceService } from '#services/OsrsPriceService.js';
import logger from '#utils/logger.js';

const router = Router();

router.get('/prices', async (_, res) => {
  try {
    const prices = await OsrsPriceService.getYamaPrices();
    if (!prices) {
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }
    res.json(prices);
  } catch (error) {
    logger.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
