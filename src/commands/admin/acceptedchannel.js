import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('acceptedchannel')
  .setDescription('Get or set the accepted submission channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Channel to forward accepted submissions to')
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
    const currentChannel = await ConfigService.getAcceptedChannel(interaction.guildId);
    if (currentChannel) {
      await interaction.reply(`Current accepted channel: <#${currentChannel}>`);
    } else {
      await interaction.reply('No accepted channel set.');
    }
    return;
  }

  // if channel exists, set it as the accepted channel
  await ConfigService.setAcceptedChannel(interaction.guildId, channel.id);
  await interaction.reply(`Accepted channel set to <#${channel.id}>`);
  logger.info(`Accepted channel set to ${channel.id} for guild ${interaction.guildId}`);
}
