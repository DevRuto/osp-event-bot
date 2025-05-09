import { Router } from 'express';
import multer from 'multer';
import { ImageService } from '#services/imageService.js';
import logger from '#utils/logger.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const backupImagePath = await ImageService.backupFile(req.file);
    if (!backupImagePath) {
      return res.status(500).json({ error: 'Failed to backup image' });
    }
    return res.status(200).json({ path: backupImagePath });
  } catch (error) {
    logger.error('Error backing up image:' + error);
    return res.status(500).json({ error: 'Failed to backup image' });
  }
});

export default router;
