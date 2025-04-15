import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('approvechannel')
  .setDescription('Get or set the approval submission channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Moderated channel for submissions to be forwarded to')
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
    const currentChannel = await ConfigService.getApprovalChannel(interaction.guildId);
    if (currentChannel) {
      await interaction.reply(`Current approval channel: <#${currentChannel}>`);
    } else {
      await interaction.reply('No approval channel set.');
    }
    return;
  }

  // if channel exists, set it as the approval channel
  await ConfigService.setApprovalChannel(interaction.guildId, channel.id);
  await interaction.reply(`Approval channel set to <#${channel.id}>`);
  logger.info(`Approval channel set to ${channel.id} for guild ${interaction.guildId}`);
}
