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
      await prisma.event.update({
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
}
