import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('create-team')
  .setDescription('Create a team')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addUserOption((option) =>
    option.setName('leader').setDescription('The team leader').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('name').setDescription('The name of the team').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('description').setDescription('The description of the team').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const leader = interaction.options.getUser('leader');
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');

  try {
    if (TeamService.isUserInTeam(leader.id)) {
      await interaction.reply(`User <@${leader.id}> is already in a team.`);
      return;
    }
    const team = await TeamService.createTeam(leader.id, name, description);
    await TeamService.addMemberToTeam(team.id, leader.id); // Add the leader to their own team
    await interaction.reply(`Team "${name}" (Leader: ${leader.tag}) created successfully!`);
    logger.info(`Team "${name}" created successfully by ${interaction.user.tag}`);
  } catch (error) {
    await interaction.reply(`Error creating team: ${error.message}`);
    logger.error(`Error creating team "${name}" by ${interaction.user.tag}: ${error.message}`);
  }
}
