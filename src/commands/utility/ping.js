import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../../logger.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  logger.info('Pong!');
  await interaction.reply('Pong!');
}
