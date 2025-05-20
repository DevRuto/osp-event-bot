import fs from 'fs/promises';
import { EventService } from '#services/eventService.js';
import { getHiscores } from 'osrs-wrapper';

const event = await EventService.getActiveEvent();
if (!event) {
  throw new Error('No active event found');
}

// Get RSN list
const rsns = [];

for (const participant of event.participants) {
  rsns.push(...participant.rsn.split(',').map((rsn) => rsn.trim().toLocaleLowerCase()));
}

async function getHiscoreWithRetry(rsn) {
  let i = 0;
  while (i++ < 5) {
    try {
      const stats = await getHiscores(rsn);
      return stats;
    } catch (error) {
      console.error(`Error fetching hiscores for ${rsn}: ${error.message}`);
      if (error.message.includes('404')) {
        console.log(`RSN ${rsn} not found. Skipping...`);
        throw new Error(`RSN ${rsn} not found`);
      }
      // Retry after a delay
      await new Promise((resolve) => setTimeout(resolve, 20000)); // 20 seconds delay
    }
  }
}

async function logHiscores() {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  // const timestamp = `2025-05-20_12-00`;
  // Create data directory if it doesn't exist
  try {
    await fs.mkdir('./hiscore_logs/' + timestamp, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    process.exit(1);
  }

  let count = 0;
  for (const rsn of rsns) {
    console.log(`[${++count}/${rsns.length}] Checking RSN: ${rsn}`);
    if (rsn === 'lvl 4 zebak') continue;
    // Check if the file already exists
    if (await fs.stat(`./hiscore_logs/${timestamp}/${rsn}.json`).catch(() => false)) {
      console.log(`File already exists for RSN: ${rsn}`);
      continue;
    }
    try {
      const stats = await getHiscoreWithRetry(rsn);
      if (stats) {
        await fs.writeFile(
          `./hiscore_logs/${timestamp}/${rsn}.json`,
          JSON.stringify(stats, null, 2),
          'utf8'
        );
      } else {
        console.log(`No stats found for RSN: ${rsn}`);
      }
    } catch (error) {
      console.error(`Error getting stats for RSN: ${rsn}`, error);
    }
  }
}

const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};

const liveCountdown = (duration) =>
  new Promise((resolve) => {
    let msRemaining = duration;

    const timer = setInterval(() => {
      msRemaining -= 1000;

      process.stdout.write(`\r⏳ Next log in: ${formatDuration(msRemaining)}   `);

      if (msRemaining <= 0) {
        clearInterval(timer);
        process.stdout.write('\n');
        resolve();
      }
    }, 1000);
  });

const getDelayUntilNext12Hour = () => {
  const now = new Date();
  const next = new Date(now);

  if (now.getHours() < 12) {
    next.setHours(12, 0, 0, 0);
  } else {
    next.setHours(24, 0, 0, 0);
  }

  return next - now;
};

async function scheduleNext12Hours() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const delay = getDelayUntilNext12Hour();
    await liveCountdown(delay);

    await logHiscores();
    // Wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

// logHiscores();
scheduleNext12Hours();
