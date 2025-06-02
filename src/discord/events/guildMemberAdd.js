import { Events, GuildMember } from 'discord.js';
import { UserService } from '#services/userService.js';
import logger from '#utils/logger.js';

export const name = Events.GuildMemberAdd;
/**
 * @param {GuildMember} interaction
 */
export async function execute(member) {
  try {
    await UserService.syncUser(member);
  } catch (error) {
    logger.error('Error during guild member add: ' + error);
  }
}
