import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('edit-team')
  .setDescription('Edit a team')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((option) =>
    option
      .setName('team')
      .setDescription('Select the team to edit')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addUserOption((option) =>
    option.setName('leader').setDescription('The team leader').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('name').setDescription('The name of the team').setRequired(false)
  )
  .addStringOption((option) =>
    option.setName('description').setDescription('The description of the team').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const teamId = interaction.options.getString('team');
  const leaderId = interaction.options.getUser('leader').id;
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');

  if (!name && !description && !leaderId) {
    await interaction.reply('Please provide at least one field to edit.');
    return;
  }

  try {
    const updatedTeam = await TeamService.updateTeam(teamId, leaderId, name, description);
    await interaction.reply(`Team ${updatedTeam.name} edited successfully!`);
    logger.info(`Team ${updatedTeam.name} ${updatedTeam.id} edited successfully!`);
  } catch (error) {
    logger.error('Error editing team', error);
    await interaction.reply('An error occurred while editing the team.');
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function autocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();
  const events = await TeamService.getTeams();
  const filtered = events.filter((event) => event.name.startsWith(focusedValue));
  const choices = filtered.map((event) => event).slice(0, 25);
  await interaction.respond(choices.map((choice) => ({ name: choice.name, value: choice.id })));
}
