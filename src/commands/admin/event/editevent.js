import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import logger from '#utils/logger.js';
import { EventService } from '#services/eventService.js';

export const data = new SlashCommandBuilder()
  .setName('edit-event')
  .setDescription('Edit an event')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName('event')
      .setDescription('Select the event to edit')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option.setName('name').setDescription('The name of the event').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('description').setDescription('The description of the event').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('startdate').setDescription('The start date of the event').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('enddate').setDescription('The end date of the event').setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName('status')
      .setDescription('The status of the event')
      .setRequired(false)
      .addChoices(
        { name: 'Planning', value: 'PLANNING' },
        { name: 'Ongoing', value: 'ONGOING' },
        { name: 'Completed', value: 'COMPLETED' },
        { name: 'Canceled', value: 'CANCELLED' }
      )
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const eventId = interaction.options.getString('event');
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');
  const startDate = interaction.options.getString('startdate');
  const endDate = interaction.options.getString('enddate');
  const status = interaction.options.getString('status');

  if (!name && !description && !startDate && !endDate && !status) {
    await interaction.reply('Please provide at least one field to edit.');
    return;
  }
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
    const updatedEvent = await EventService.updateEvent(
      eventId,
      name,
      description,
      startDate,
      endDate,
      status
    );
    await interaction.reply(`Event "${updatedEvent.name}" edited successfully!`);
    logger.info(
      `Event "${updatedEvent.name}" (${updatedEvent.id}) edited successfully by ${interaction.user.tag}`
    );
  } catch (error) {
    await interaction.reply('An error occurred while editing the event. Please try again.');
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function autocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();
  const events = await EventService.getEvents();
  const filtered = events.filter((event) => event.name.startsWith(focusedValue));
  const choices = filtered.map((event) => event).slice(0, 25);
  await interaction.respond(choices.map((choice) => ({ name: choice.name, value: choice.id })));
}
