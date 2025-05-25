import fs from 'fs/promises';
import path from 'path';
import { EventService } from './eventService.js';
import { calculateEhb, calculateEhp } from '#utils/efficiency.js';

const HISCORE_DIR = './hiscore_logs';

function parseTimestamp(name) {
  return new Date(name.replace('_', 'T').replace(/-/g, ':').replace('T', 'T') + ':00');
}

function sortByTimestampAsc(a, b) {
  return parseTimestamp(a) - parseTimestamp(b);
}

const snapshotDirs = (await fs.readdir(HISCORE_DIR))
  .filter((name) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/.test(name))
  .sort(sortByTimestampAsc);

const earliestPath = path.join(HISCORE_DIR, snapshotDirs[0]);
const latestPath = path.join(HISCORE_DIR, snapshotDirs.at(-1));

const startData = await readSnapshot(earliestPath);
const endData = await readSnapshot(latestPath);

const ironRsn = [
  'ruto',
  'politoed22',
  'manlikemooks',
  'sniken',
  'bottommeirl',
  'papi chubb',
  'a llergic',
  'fe sekiro',
  'lil dodgyy',
  'clue relic',
  'eatan',
  'pepper fe',
  'luckylothory',
  'biverlyhills',
  'toxic dane',
  'no 1 goblin',
];

const hiscoreCache = {};

function getAccountType(rsn) {
  if (ironRsn.includes(rsn.toLowerCase())) {
    return 'iron';
  }
  return 'main';
}

async function readSnapshot(folderPath) {
  const files = await fs.readdir(folderPath);
  const data = {};

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const rsn = path.basename(file, '.json');
    const content = await fs.readFile(path.join(folderPath, file), 'utf-8');
    try {
      data[rsn] = JSON.parse(content);
    } catch (e) {
      console.warn(`Failed to parse ${file}:`, e.message);
    }
  }

  return data;
}

function diffObjects(start, end, keys) {
  const result = {};
  for (const key of Object.keys(end)) {
    result[key] = {};
    for (const stat of keys) {
      const startVal = start?.[key]?.[stat] ?? 0;
      const endVal = end[key][stat] ?? 0;
      result[key][stat] = endVal - startVal;
    }
  }
  return result;
}

const alts = {
  'lvl 4 zebak': 'phrukurself',
};

async function calculateUser(rsn) {
  const start = startData[rsn] || { skills: {}, minigames: {}, bosses: {} };
  const end = endData[rsn] || endData[alts[rsn]] || null;
  if (!end) {
    return null;
  }

  const diff = {
    skills: diffObjects(start.skills, end.skills, ['rank', 'level', 'xp']),
    minigames: diffObjects(start.minigames, end.minigames, ['rank', 'score']),
    bosses: diffObjects(start.bosses, end.bosses, ['rank', 'kills']),
  };

  const accountType = getAccountType(rsn);

  return {
    rsn,
    start,
    end,
    diff,
    ehb: await calculateEhb(accountType, diff.bosses),
    ehp: await calculateEhp(accountType, diff.skills),
  };
}

export class HiscoreService {
  static async loadHiscore() {
    const event = await EventService.getActiveEvent();
    if (!event) {
      throw new Error('No active event found');
    }
    const rsns = event.participants
      .map((p) => p.rsn)
      .flatMap((rsn) => rsn.split(',').map((r) => r.trim()));

    for (const rsn of rsns) {
      if (!hiscoreCache[rsn]) {
        try {
          hiscoreCache[rsn] = await calculateUser(rsn);
        } catch (e) {
          console.error(`Error processing hiscore data for ${rsn}:`, e.message);
          hiscoreCache[rsn] = { rsn, error: e.message };
        }
      }
      if (!hiscoreCache[rsn]) {
        console.warn(`No hiscore data found for ${rsn}`);
      }
    }
    return hiscoreCache;
  }
}
