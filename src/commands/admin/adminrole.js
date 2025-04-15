import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('adminrole')
  .setDescription('Get or set admin role')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption((option) =>
    option.setName('role').setDescription('Role to be set as admin role').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const role = interaction.options.getRole('role');

  // if role doesn't exist, get role channel if it exists
  if (!role) {
    const currentRole = await ConfigService.getAdminRole(interaction.guildId);
    if (currentRole) {
      await interaction.reply(`Current admin role: <@&${currentRole}>`);
    } else {
      await interaction.reply('No admin role set.');
    }
    return;
  }

  // if role exists, set it as the admin role
  await ConfigService.setAdminRole(interaction.guildId, role.id);
  await interaction.reply(`Admin role set to <@&${role.id}>`);
  logger.info(`Admin role set to ${role.id} for guild ${interaction.guildId}`);
}
