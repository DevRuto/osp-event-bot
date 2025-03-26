import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  console.log('Pong!');
  await interaction.reply('Pong!');
}
