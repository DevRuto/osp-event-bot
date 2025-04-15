import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('activate-event')
  .setDescription('Set the event to active for the bot context')
  .addStringOption((option) =>
    option
      .setName('event')
      .setDescription('The event to activate')
      .setRequired(true)
      .setAutocomplete(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const eventId = interaction.options.getString('event');
  try {
    const event = await EventService.activateEvent(eventId);
    await interaction.reply(`Event ${event.name} has been activated.`);
  } catch (error) {
    logger.error('Error activating event', error);
    await interaction.reply('An error occurred while activating the event.');
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
