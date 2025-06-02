import { Events, MessageFlags, CommandInteraction } from 'discord.js';
import logger from '#utils/logger.js';
import { handle as handleChatCommand } from './handlers/chatCommand.js';

export const name = Events.InteractionCreate;
/**
 * @param {CommandInteraction} interaction
 */
export async function execute(interaction) {
  if (interaction.isChatInputCommand()) {
    await handleChatCommand(interaction);
  }
}
