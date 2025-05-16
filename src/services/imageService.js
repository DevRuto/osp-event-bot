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
      const uniqueId = uuidv4().slice(0, 8);
      const pathname = new URL(imageUrl).pathname; // strips query params
      const lastSegment = pathname.split('/').pop(); // get filename
      const fileExtension = lastSegment.includes('.') ? lastSegment.split('.').pop() : null;
      const fileName = `${uniqueId}.${fileExtension || 'png'}`; // default to png if no extension
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

  static async backupFile(file) {
    try {
      const uniqueId = uuidv4().slice(0, 8);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uniqueId}.${fileExtension}`;
      const filePath = `./images/${fileName}`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(filePath, file.buffer);
      logger.info(`Image ${file.originalname} backed up to ${filePath}`);
      return `/images/${fileName}`;
    } catch (error) {
      logger.error('Error backing up image:', error);
      throw error;
    }
  }
}
