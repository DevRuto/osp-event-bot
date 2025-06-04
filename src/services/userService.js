import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';

/**
 * @typedef {import('#utils/prisma/client').DiscordUser} DiscordUser
 */

export class UserService {
  /**
   * Sync a Discord member to the database
   * @param {import('discord.js').GuildMember} member - The Discord member to sync
   * @returns {Promise<DiscordUser>} The synced user
   */
  static async syncUser(member) {
    try {
      const existingUser = await prisma.discordUser.findUnique({
        where: { id: member.id },
      });

      if (!existingUser) {
        return await prisma.discordUser.create({
          data: {
            id: member.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            avatar: member.user.avatarURL(),
            roles: JSON.stringify(member.roles.cache.map((role) => role.id)),
            joinedAt: member.joinedAt,
            lastSeen: new Date(),
          },
        });
      } else {
        return await prisma.discordUser.update({
          where: { id: member.id },
          data: {
            username: member.user.username,
            discriminator: member.user.discriminator,
            avatar: member.user.avatarURL(),
            roles: JSON.stringify(member.roles.cache.map((role) => role.id)),
            lastSeen: new Date(),
          },
        });
      }
    } catch (error) {
      logger.error(error, `Error syncing user ${member.user.tag}`);
      throw error;
    }
  }

  /**
   * Sync all members of a guild to the database
   * @param {import('discord.js').Guild} guild - The Discord guild to sync members from
   * @returns {Promise<void>}
   */
  static async syncGuildMembers(guild) {
    try {
      logger.info(`Syncing members for guild: ${guild.name}`);
      const members = await guild.members.fetch();

      for (const [, member] of members) {
        await this.syncUser(member);
      }
    } catch (error) {
      logger.error(error, `Error syncing guild ${guild.name}`);
      throw error;
    }
  }

  /**
   * Sync all members from all guilds the bot is in
   * @param {import('discord.js').Client} client - The Discord client
   * @returns {Promise<void>}
   */
  static async syncAllGuildMembers(client) {
    try {
      const guilds = client.guilds.cache;
      for (const [, guild] of guilds) {
        await this.syncGuildMembers(guild);
      }
      logger.info('Finished syncing all server members to database');
    } catch (error) {
      logger.error(error, 'Error syncing server members');
      throw error;
    }
  }
}
