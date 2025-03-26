import { Events } from 'discord.js';
import { UserService } from '../services/userService.js';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  try {
    await UserService.syncAllGuildMembers(client);
  } catch (error) {
    console.error('Error during initial user sync:', error);
  }
}
