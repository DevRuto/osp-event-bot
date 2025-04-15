import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('register-team')
  .setDescription('Register team to the event')
  .addStringOption((option) =>
    option
      .setName('event')
      .setDescription('Select the event to register the team to')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName('team')
      .setDescription('Select the team to register')
      .setRequired(true)
      .setAutocomplete(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const eventId = interaction.options.getString('event');
  const teamId = interaction.options.getString('team');
  // Register the team to the event
  const event = await EventService.getEventById(eventId);
  if (!event) {
    await interaction.reply('Event not found');
    return;
  }
  const team = await TeamService.getTeamById(teamId);
  if (!team) {
    await interaction.reply('Team not found');
    return;
  }
  try {
    await EventService.registerTeamToEvent(eventId, teamId);
    await interaction.reply(`Team ${team.name} registered to event ${event.name}`);
    logger.info(`Team ${teamId} registered to event ${eventId}`);
  } catch (error) {
    logger.error('Error registering team to event', error);
    await interaction.reply('An error occurred while registering the team to the event.');
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function autocomplete(interaction) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name === 'event') {
    const events = await EventService.getEvents();
    const filtered = events.filter((event) => event.name.startsWith(focusedOption.value));
    const choices = filtered.map((event) => event).slice(0, 25);
    await interaction.respond(choices.map((choice) => ({ name: choice.name, value: choice.id })));
  } else if (focusedOption.name === 'team') {
    const teams = await TeamService.getTeams();
    const filtered = teams.filter((team) => team.name.startsWith(focusedOption.value));
    const choices = filtered.map((event) => event).slice(0, 25);
    await interaction.respond(choices.map((choice) => ({ name: choice.name, value: choice.id })));
  }
}
