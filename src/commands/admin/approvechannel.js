import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('approvechannel')
  .setDescription('Get or set the approval submission channel')
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

  // Check if user has admin permissions
  // Check custom role first
  if (!interaction.member.permissions.has('Administrator')) {
    const customRole = await ConfigService.getAdminRole(interaction.guildId);
    if (customRole) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.roles.cache.has(customRole)) {
        await interaction.reply('You do not have permission to set the approval channel.');
        return;
      }
    } else {
      await interaction.reply('You do not have permission to set the approval channel.');
      return;
    }
  }

  // if channel exists, set it as the approval channel
  await ConfigService.setApprovalChannel(interaction.guildId, channel.id);
  await interaction.reply(`Approval channel set to <#${channel.id}>`);
  logger.info(`Approval channel set to ${channel.id} for guild ${interaction.guildId}`);
}
