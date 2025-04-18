import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('addmember')
  .setDescription('Add a registered member to a team.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((option) =>
    option
      .setName('team')
      .setDescription('The team to add the member to.')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addUserOption((option) =>
    option.setName('member').setDescription('The member to add to the team.').setRequired(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const teamId = interaction.options.getString('team');
  const member = interaction.options.getUser('member');

  // Check if the user is already in the team
  const team = await TeamService.getTeamById(teamId);
  const isMember = team.members.some((member) => member.user.id === member.id);
  if (isMember) {
    await interaction.reply('This user is already a member of the team.');
    return;
  }
  // Check if the user is already in another team
  if (await TeamService.isUserInTeam(member.id)) {
    await interaction.reply('This user is already in another team.');
    return;
  }
  try {
    const team = await TeamService.addMemberToTeam(teamId, member.id);
    await interaction.reply(`Member <@${member.id}> added to team ${team.name} successfully!`);
    logger.info(
      `Member ${member.username} - ${member.id} added to team ${team.name} ${team.id} successfully!`
    );
  } catch (error) {
    logger.error('Error adding member to team', error);
    await interaction.reply('An error occurred while adding the member to the team.');
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
