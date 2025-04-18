import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('signupchannel')
  .setDescription('Get or set the signed up channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Channel to forward signups to')
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildText)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');

  // if channel doesn't exist, get current channel if it exists
  if (!channel) {
    const currentChannel = await ConfigService.getSignedUpChannel(interaction.guildId);
    if (currentChannel) {
      await interaction.reply(`Current signed up channel: <#${currentChannel}>`);
    } else {
      await interaction.reply('No signed up channel set.');
    }
    return;
  }

  // if channel exists, set it as the signed up channel
  await ConfigService.setSignedUpChannel(interaction.guildId, channel.id);
  await interaction.reply(`Signed up channel set to <#${channel.id}>`);
  logger.info(`Signed up channel set to ${channel.id} for guild ${interaction.guildId}`);
}
