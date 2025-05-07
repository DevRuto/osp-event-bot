import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';

export class EventService {
  /**
   * Create a new event in the database
   * @param {String} name - The name of the event
   * @param {String} description - The description of the event
   * @param {String} startDate - (Optional) The start date of the event
   * @param {String} endDate - (Optional) The end date of the event
   * @returns {Promise<void>}
   */
  static async createEvent(name, description, startDate = undefined, endDate = undefined) {
    // Validate inputs
    if (!name) {
      throw new Error('Event name is required');
    }
    // Create the event
    try {
      const eventData = { name, description };
      if (startDate) eventData.startDate = startDate;
      eventData.startDate = new Date().toISOString();
      if (endDate !== undefined) eventData.endDate = endDate;

      await prisma.event.create({
        data: eventData,
      });
    } catch (error) {
      console.log(error);
      logger.error('Error creating event', error.message);
      throw error;
    }
  }

  /**
   * Get all events
   * @returns {Promise<import('@prisma/client').Event[]>} An array of events
   */
  static async getEvents() {
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          startDate: 'asc',
        },
      });
      return events;
    } catch (error) {
      logger.error('Error getting events', error);
      throw error;
    }
  }

  /**
   * Delete an event by ID
   * @param {String} eventId - The ID of the event
   * @returns {Promise<void>}
   */
  static async deleteEvent(eventId) {
    try {
      await prisma.event.delete({
        where: {
          id: eventId,
        },
      });
    } catch (error) {
      logger.error(`Error deleting event with ID ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get an event by ID
   * @param {String} eventId - The ID of the event
   * @return {Promise<import('@prisma/client').Event>} The event object
   */
  static async getEventById(eventId) {
    try {
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
        include: {
          teams: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      return event;
    } catch (error) {
      logger.error(`Error getting event with ID ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Update an event by ID
   * @param {String} eventId - The ID of the event
   * @param {Object} data - The data to update
   * @returns {Promise<import('@prisma/client').Event}
   */
  static async updateEvent(eventId, name, description, startDate, endDate, status) {
    const updateData = {};
    try {
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      if (status) updateData.status = status;

      return await prisma.event.update({
        where: {
          id: eventId,
        },
        data: updateData,
      });
    } catch (error) {
      console.log(error);
      logger.error(`Error updating event with ID ${eventId}:`, error, updateData);
      throw error;
    }
  }

  /**
   * Activate event
   */
  static async activateEvent(eventId) {
    try {
      // Deactivate all other events
      await prisma.event.updateMany({
        where: {
          active: true,
        },
        data: {
          active: false,
        },
      });
      return await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          active: true,
        },
      });
    } catch (error) {
      logger.error(`Error activating event with ID ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Regsiter team to event
   */
  static async registerTeamToEvent(eventId, teamId) {
    try {
      await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          teams: {
            connect: {
              id: teamId,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      logger.error(`Error registering team ${teamId} to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get active event
   */
  static async getActiveEvent() {
    try {
      const event = await prisma.event.findFirst({
        where: {
          active: true,
        },
        include: {
          teams: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
      return event;
    } catch (error) {
      logger.error('Error getting active event', error);
      throw error;
    }
  }

  /**
   * Check if a user is a registered member of an active event
   * @param {String} discordId - The Discord ID of the user
   */
  static async isUserRegistered(discordId) {
    try {
      const event = await prisma.event.findFirst({
        where: {
          active: true,
          participants: {
            some: {
              user: {
                id: discordId,
              },
              status: 'REGISTERED',
            },
          },
        },
      });
      return !!event;
    } catch (error) {
      logger.error(`Error checking if user ${discordId} is registered:`, error);
      throw error;
    }
  }

  /**
   * Register a user to the active event
   * @param {String} discordId - The Discord ID of the user
   * @param {String} rsn - The RuneScape name of the user
   * @param {String} duo - (Optional) The RuneScape name of the user's duo partner
   */
  static async registerUserToEvent(discordId, rsn, duo) {
    try {
      const activeEvent = await this.getActiveEvent();
      if (!activeEvent) {
        throw new Error('No active event found');
      }
      const participant = await prisma.eventParticipant.create({
        data: {
          status: 'REGISTERED',
          rsn: rsn?.toLocaleLowerCase(),
          note: duo?.toLocaleLowerCase(),
          user: { connect: { id: discordId } },
          event: { connect: { id: activeEvent.id } },
        },
      });
      return participant;
    } catch (error) {
      logger.error(`Error registering user ${discordId} to event:`, error);
      throw error;
    }
  }

  /**
   * Update user's RSN in the active event
   * @param {String} discordId - The Discord ID of the user
   */
  static async updateUserRsn(discordId, rsn, duo) {
    try {
      const activeEvent = await this.getActiveEvent();
      if (!activeEvent) {
        throw new Error('No active event found');
      }
      const data = {
        rsn: rsn?.toLocaleLowerCase(),
      };
      if (duo) {
        data.note = duo.toLocaleLowerCase();
      }
      const participant = await prisma.eventParticipant.update({
        where: {
          userId_eventId: {
            userId: discordId,
            eventId: activeEvent.id,
          },
        },
        data,
      });
      return participant;
    } catch (error) {
      logger.error(`Error updating RSN for user ${discordId}:`, error);
      throw error;
    }
  }

  static async getUserDetails(discordId) {
    try {
      const activeEvent = await this.getActiveEvent();
      if (!activeEvent) {
        throw new Error('No active event found');
      }
      const participant = await prisma.eventParticipant.findFirst({
        where: {
          userId: discordId,
          eventId: activeEvent.id,
        },
      });
      return participant;
    } catch (error) {
      logger.error(`Error getting user details for ${discordId}:`, error);
      throw error;
    }
  }
}
