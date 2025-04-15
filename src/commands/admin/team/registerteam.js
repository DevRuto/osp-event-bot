import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('register-team')
  .setDescription('Register team to the event')
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
  const teamId = interaction.options.getString('team');
  // Register the team to the event
  const event = await EventService.getActiveEvent();
  if (!event) {
    await interaction.reply('No active event found');
    return;
  }
  const team = await TeamService.getTeamById(teamId);
  if (!team) {
    await interaction.reply('Team not found');
    return;
  }
  try {
    await EventService.registerTeamToEvent(event.id, teamId);
    await interaction.reply(`Team ${team.name} registered to event ${event.name}`);
    logger.info(`Team ${teamId} registered to event ${event.id}`);
  } catch (error) {
    logger.error('Error registering team to event', error);
    await interaction.reply('An error occurred while registering the team to the event.');
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function autocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();
  const teams = await TeamService.getTeams();
  const filtered = teams.filter((team) => team.name.startsWith(focusedValue));
  const choices = filtered.map((event) => event).slice(0, 25);
  await interaction.respond(choices.map((choice) => ({ name: choice.name, value: choice.id })));
}
