import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ConfigService } from '#services/configService.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('removemember')
  .setDescription('Remove a member from the team.')
  .addUserOption((option) =>
    option.setName('member').setDescription('The member to remove from the team.').setRequired(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  if (!interaction.member.permissions.has('Administrator')) {
    const customRole = await ConfigService.getAdminRole(interaction.guildId);
    if (customRole) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.roles.cache.has(customRole)) {
        await interaction.reply('You do not have permission to set the approval channel.');
        return;
      }
    } else {
      await interaction.reply('You do not have permission to set the approval channel.');
      return;
    }
  }
  const member = interaction.options.getUser('member');

  try {
    // Check if the user is in a team
    if (!(await TeamService.isUserInTeam(member.id))) {
      await interaction.reply('This user is not in any team.');
      return;
    }
    // Remove member from all teams
    await TeamService.removeMemberFromAllTeams(member.id);
    await interaction.reply(`Member <@${member.id}> removed from the team successfully!`);
    logger.info(`Member ${member.username} - ${member.id} removed from the team successfully!`);
  } catch (error) {
    logger.error('Error removing member from team', error);
    await interaction.reply('An error occurred while removing the member from the team.');
  }
}
