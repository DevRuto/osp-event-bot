import { Events } from 'discord.js';
import { UserService } from '#services/userService.js';
import logger from '#utils/logger.js';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
  logger.info(`Ready! Logged in as ${client.user.tag}`);

  try {
    await UserService.syncAllGuildMembers(client);
  } catch (error) {
    logger.error('Error during initial user sync:', error);
  }
}
