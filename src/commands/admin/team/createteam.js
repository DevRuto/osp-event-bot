import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { TeamService } from '#services/teamService.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('create-team')
  .setDescription('Create a team')
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
  const leader = interaction.options.getUser('leader');
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');

  try {
    await TeamService.createTeam(leader.id, name, description);
    await interaction.reply(`Team "${name}" (Leader: ${leader.tag}) created successfully!`);
    logger.info(`Team "${name}" created successfully by ${interaction.user.tag}`);
  } catch (error) {
    await interaction.reply(`Error creating team: ${error.message}`);
    logger.error(`Error creating team "${name}" by ${interaction.user.tag}: ${error.message}`);
  }
}
