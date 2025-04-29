import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('signeduprole')
  .setDescription('Get or Set the signed up role')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('The role to set as the signed up role')
      .setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const role = interaction.options.getRole('role');

  // if role doesn't exist, get current role if it exists
  if (!role) {
    const currentRole = await ConfigService.getSignedUpRole(interaction.guildId);
    if (currentRole) {
      await interaction.reply(`Current signed up role: <@&${currentRole}>`);
    } else {
      await interaction.reply('No signed up role set.');
    }
    return;
  }

  // if role exists, set it as the signed up role
  await ConfigService.setSignedUpRole(interaction.guildId, role.id);
  await interaction.reply(`Signed up role set to <@&${role.id}>`);
  logger.info(`Signed up role set to ${role.id} for guild ${interaction.guildId}`);
}
