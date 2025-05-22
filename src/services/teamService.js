import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';

export class TeamService {
  /**
   * Create a new team in the database
   * @param {String} leaderId - (Optional) The ID of the team leader
   * @param {String} name - The name of the team
   * @param {String} description - The description of the team
   * @returns {Promise<import('@prisma/client').Team>} The created team object
   */
  static async createTeam(leaderId, name, description) {
    // Validate inputs
    if (!name || !leaderId) {
      throw new Error('Team name and leader id is required');
    }
    // Create the team
    try {
      return await prisma.team.create({
        data: {
          name,
          description,
          leader: {
            connect: {
              id: leaderId,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error creating team', error.message);
      throw error;
    }
  }

  /**
   * Get all teams
   * @returns {Promise<import('@prisma/client').Team[]>} An array of teams
   */
  static async getTeams() {
    try {
      const teams = await prisma.team.findMany({
        orderBy: {
          name: 'asc',
        },
      });
      return teams;
    } catch (error) {
      logger.error('Error getting teams', error);
      throw error;
    }
  }

  /**
   * Delete a team by ID
   * @param {String} teamId - The ID of the team
   * @returns {Promise<void>}
   */
  static async deleteTeam(teamId) {
    try {
      await prisma.team.delete({
        where: {
          id: teamId,
        },
      });
    } catch (error) {
      logger.error('Error deleting team', error);
      throw error;
    }
  }
  /**
   * @typedef {import('@prisma/client').Team & {
   *   leader: import('@prisma/client').DiscordUser,
   *   members: (import('@prisma/client').TeamMember & {
   *     user: import('@prisma/client').DiscordUser
   *   })[]
   * }} TeamWithDetails
   */

  /**
   * Get a team by ID
   * @param {String} teamId - The ID of the team
   * @returns {Promise<TeamWithDetails>} The team object
   */
  static async getTeamById(teamId) {
    try {
      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
        include: {
          leader: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error) {
      logger.error('Error getting team by ID', error);
      throw error;
    }
  }

  /**
   * Get current team of a user
   * @param {String} discordId - The ID of the user
   * @returns {Promise<TeamWithDetails>} The team object
   */
  static async getCurrentTeam(discordId) {
    try {
      const team = await prisma.team.findFirst({
        where: {
          members: {
            some: {
              user: {
                id: discordId,
              },
            },
          },
        },
        include: {
          leader: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      return team;
    } catch (error) {
      logger.error('Error getting current team', error);
      throw error;
    }
  }

  /**
   * Update a team by ID
   * @param {String} teamId - The ID of the team
   * @param {String} leaderId - The ID of the team leader
   * @param {Object} data - The data to update
   * @returns {Promise<import('@prisma/client').Team>} The updated team object
   */
  static async updateTeam(teamId, leaderId, name, description) {
    const updateData = {};
    try {
      if (leaderId) {
        updateData.leader = {
          connect: {
            id: leaderId,
          },
        };
      }
      if (name) updateData.name = name;
      if (description) updateData.description = description;

      return await prisma.team.update({
        where: {
          id: teamId,
        },
        data: updateData,
      });
    } catch (error) {
      logger.error('Error updating team', error);
      throw error;
    }
  }

  /**
   * Check if a user is in a team
   * @param {String} discordId - The discord Id of the user
   */
  static async isUserInTeam(discordId) {
    try {
      const team = await prisma.team.findFirst({
        where: {
          members: {
            some: {
              user: {
                id: discordId,
              },
            },
          },
        },
      });
      return !!team;
    } catch (error) {
      logger.error('Error checking if user is in team', error);
      throw error;
    }
  }

  /**
   * Add a member to a team
   * @param {String} teamId - The ID of the team
   * @param {String} userId - The ID of the user
   * @returns {Promise<void>}
   */
  static async addMemberToTeam(teamId, userId) {
    try {
      return await prisma.team.update({
        where: {
          id: teamId,
        },
        data: {
          members: {
            create: {
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      logger.error('Error adding member to team', error);
      throw error;
    }
  }

  static async removeMemberFromTeam(teamId, userId) {
    try {
      await prisma.teamMember.deleteMany({
        where: {
          teamId,
          userId,
        },
      });
    } catch (error) {
      logger.error('Error removing member from team', error);
      throw error;
    }
  }

  /**
   * Remove member from all teams
   * @param {String} userId - The ID of the user
   * @returns {Promise<void>}
   */
  static async removeMemberFromAllTeams(userId) {
    try {
      await prisma.teamMember.deleteMany({
        where: {
          user: {
            id: userId,
          },
        },
      });
    } catch (error) {
      logger.error('Error removing member from all teams', error);
      throw error;
    }
  }
}
