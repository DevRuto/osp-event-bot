import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import logger from '#utils/logger.js';
import { EventService } from '#services/eventService.js';

export const data = new SlashCommandBuilder()
  .setName('create-event')
  .setDescription('Create an event')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option.setName('name').setDescription('The name of the event').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('description').setDescription('The description of the event').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('startdate').setDescription('The start date of the event').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('enddate').setDescription('The end date of the event').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');
  const startDate = interaction.options.getString('startdate');
  const endDate = interaction.options.getString('enddate');

  // validate datetime format
  const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  if (startDate && !dateFormat.test(startDate)) {
    await interaction.reply('Invalid start date format. Please use ISO 8601 format.');
    return;
  }
  if (endDate && !dateFormat.test(endDate)) {
    await interaction.reply('Invalid end date format. Please use ISO 8601 format.');
    return;
  }

  try {
    await EventService.createEvent(name, description, startDate, endDate);
    await interaction.reply(`Event "${name}" created successfully!`);
    logger.info(`Event "${name}" created successfully by ${interaction.user.tag}`);
  } catch (error) {
    await interaction.reply('An error occurred while creating the event. Please try again.');
  }
}
