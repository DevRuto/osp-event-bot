import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ConfigService } from '#services/configService.js';
import { EventService } from '#services/eventService.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('submit')
  .setDescription('Submit an item to the event')
  .addStringOption((option) =>
    option.setName('name').setDescription('The name of the item').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('value').setDescription('The value of the item').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('image').setDescription('The image link to the item').setRequired(false)
  )
  .addAttachmentOption((option) =>
    option.setName('attachment').setDescription('Attached image of item').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const approvalChannel = await ConfigService.getApprovalChannel(interaction.guildId);
  /**
   * @type {import('discord.js').TextChannel}
   */
  let channel;
  if (!approvalChannel) {
    await interaction.reply('Approval channel not set. Please contact an admin.');
    logger.error('Approval channel not set for guild: ' + interaction.guildId);
    return;
  } else {
    channel = await interaction.client.channels.fetch(approvalChannel);
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply(
        'Approval channel is not a valid text channel. Please contact an admin.'
      );
      logger.error(
        'Approval channel is not a valid text channel for guild: ' +
          interaction.guildId +
          ' - Channel ID: ' +
          approvalChannel
      );
      return;
    }
  }

  // Check if the user is registered for the event'
  if (!(await EventService.isUserRegistered(interaction.user.id))) {
    await interaction.reply({
      content: 'You are not registered for the event. Please register first.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Check if user is part of a team
  if (!(await TeamService.isUserInTeam(interaction.user.id))) {
    await interaction.reply({
      content: 'You are not part of a team. Please contact your team leader.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Check if the event has started
  const activeEvent = await EventService.getActiveEvent();
  if (!activeEvent) {
    await interaction.reply({
      content: 'There is no active event to submit items for.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (activeEvent.status !== 'ONGOING') {
    await interaction.reply({
      content: 'The event is not active. Please check back later.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const name = interaction.options.getString('name');
  const value = interaction.options.getString('value');
  const image = interaction.options.getString('image');
  const attachment = interaction.options.getAttachment('attachment');

  const proof = image || attachment?.url;
  if (!proof) {
    await interaction.reply('Please provide an image or attachment as proof of the item.');
    return;
  }

  logger.info(`Item submitted: ${name} - ${value}`);
  await interaction.reply(`Item submitted: ${name} - ${value}`);

  // Forward the submission to the approval channel
  const embed = {
    title: 'New Item Submission',
    description: `Name: ${name}\nValue: ${value}`,
    image: { url: proof },
    fields: [{ name: 'Status', value: 'Pending', inline: false }],
    footer: { text: `Submitted by: ${interaction.user.tag}` },
  };
  if (attachment) {
    embed.image.url = attachment.url;
  }
  // Create approve and deny buttons
  const approve = new ButtonBuilder()
    .setCustomId('submission_approve_1234')
    .setLabel('Approve')
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId('submission_deny_1234')
    .setLabel('Deny')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(approve, deny);
  await channel.send({
    embeds: [embed],
    components: [row],
  });
}
