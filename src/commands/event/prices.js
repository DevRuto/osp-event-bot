import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { OsrsPriceService } from '#services/OsrsPriceService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('prices')
  .setDescription('Get current Yama prices');

const formatPricesAsTable = (data) => {
  const entries = Object.entries(data).sort(([a], [b]) => b.localeCompare(a));

  const longestNameLength = entries.reduce((max, [item]) => Math.max(max, item.length), 0);
  const longestPriceLength = entries.reduce(
    (max, [, price]) => Math.max(max, price.toLocaleString().length),
    0
  );

  const header = `${'Item'.padEnd(longestNameLength)} | Price (gp)`;
  const divider = `${'-'.repeat(longestNameLength)}-|------------`;

  const rows = entries.map(([item, price]) => {
    const name = item.padEnd(longestNameLength);
    const gp = price.toLocaleString().padEnd(longestPriceLength);
    return `${name} | ${gp}`;
  });

  return '```yaml\n' + [header, divider, ...rows].join('\n') + '\n```';
};

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  try {
    const prices = await OsrsPriceService.getYamaPrices();
    if (!prices) {
      return interaction.reply({ content: 'Failed to fetch prices' });
    }
    await interaction.reply({ content: formatPricesAsTable(prices) });
  } catch (error) {
    logger.error('Error fetching prices: ' + error.message);
    await interaction.reply({ content: 'Internal server error. ' + error.message });
  }
}
