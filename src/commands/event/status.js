import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import { TeamService } from '#services/teamService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Your current status in the event')
  .addUserOption((option) =>
    option.setName('user').setDescription('The user to get the status of').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const user = interaction.options.getUser('user') || interaction.user;
  const event = await EventService.getActiveEvent();
  if (!event) {
    await interaction.reply('No active event found');
    return;
  }
  if (!(await EventService.isUserRegistered(user.id))) {
    await interaction.reply({
      content: 'You are not registered for the event.',
    });
    return;
  }
  const team = await TeamService.getCurrentTeam(user.id);
  const userDetail = await EventService.getUserDetails(user.id);
  const fields = [
    { name: 'Your RSN', value: userDetail.rsn || 'None', inline: true },
    ...(userDetail.note
      ? [{ name: 'Your Duo Partner', value: userDetail.note, inline: true }]
      : []),
    { name: 'Team', value: team?.name || 'None', inline: true },
  ];
  const embed = {
    title: event.name,
    description: event.description,
    fields,
  };
  await interaction.reply({ embeds: [embed] });
}
