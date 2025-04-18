import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';
import { getColorFromName } from '#utils/color.js';

export const data = new SlashCommandBuilder()
  .setName('team')
  .setDescription('Get Team information')
  .addStringOption((option) =>
    option
      .setName('team')
      .setDescription('Select the team to get information about')
      .setRequired(false)
      .setAutocomplete(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const teamId = interaction.options.getString('team');
  const team = teamId
    ? await TeamService.getTeamById(teamId)
    : await TeamService.getCurrentTeam(interaction.user.id);
  if (!team) {
    await interaction.reply('Team not found');
    return;
  }
  const embed = {
    title: team.name,
    description: team.description,
    fields: [
      { name: 'Leader', value: `<@${team.leader.discordId}>`, inline: true },
      {
        name: 'Members',
        value:
          team.members
            .filter((member) => member.user.discordId !== team.leader.discordId)
            .map((member, index) => `${index + 1}. <@${member.user.discordId}>`)
            .join('\n') || 'None',
        inline: false,
      },
    ],
    color: getColorFromName(team.name),
  };
  await interaction.reply({ embeds: [embed] });
  logger.info(`Team info requested: ${team.name}`);
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
