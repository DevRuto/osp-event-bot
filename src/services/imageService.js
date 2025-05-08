import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import logger from '#utils/logger.js';

export class ImageService {
  static async backupImageUrl(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const uniqueId = uuidv4();
      const fileExtension = imageUrl.split('.').pop();
      const fileName = `${uniqueId}.${fileExtension}`;
      const filePath = `./images/${fileName}`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(filePath, buffer);
      logger.info(`Image ${imageUrl} backed up to ${filePath}`);
      return `/images/${fileName}`;
    } catch (error) {
      logger.error('Error backing up image:', error);
      throw error;
    }
  }
}
