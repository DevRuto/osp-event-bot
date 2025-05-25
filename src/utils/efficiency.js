import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ./efficiency folder contains json efficiency data from WiseOldMan
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountTypes = ['main', 'iron'];

const cache = {};

export async function getEhbRate(accountType) {
  if (!accountTypes.includes(accountType)) {
    throw new Error(`Invalid account type: ${accountType}`);
  }

  if (cache[`${accountType}_ehb`]) {
    return cache[`${accountType}_ehb`];
  }

  const filePath = path.join(__dirname, 'efficiency', `${accountType}_ehb.json`);

  const womEhb = await fs
    .readFile(filePath, 'utf8')
    .then((data) => JSON.parse(data))
    .catch((err) => {
      console.error(`Error reading file ${filePath}:`, err);
      throw err;
    });
  cache[`${accountType}_ehb`] = womEhb;
  return womEhb;
}

export async function getEhpRate(accountType) {
  if (!accountTypes.includes(accountType)) {
    throw new Error(`Invalid account type: ${accountType}`);
  }
  if (cache[`${accountType}_ehp`]) {
    return cache[`${accountType}_ehp`];
  }

  const filePath = path.join(__dirname, 'efficiency', `${accountType}_ehp.json`);

  const womEhp = await fs
    .readFile(filePath, 'utf8')
    .then((data) => JSON.parse(data))
    .catch((err) => {
      console.error(`Error reading file ${filePath}:`, err);
      throw err;
    });
  cache[`${accountType}_ehp`] = womEhp;
  return womEhp;
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase to snake_case
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // PascalCase edge cases
    .toLowerCase();
}

export async function calculateEhp(accountType, skills) {
  const rates = await getEhpRate(accountType);

  const breakdown = {};
  let totalEHP = 0;

  for (const { skill, methods } of rates) {
    const latestMethod = methods.at(-1);
    const rate = latestMethod?.rate ?? 0;

    if (rate <= 0) continue;

    const xp = skills?.[skill]?.xp ?? 0;
    const ehp = xp / rate;

    breakdown[skill] = +ehp.toFixed(2);
    totalEHP += ehp;
  }

  return {
    total: +totalEHP.toFixed(2),
    breakdown,
  };
}

export async function calculateEhb(accountType, bosses) {
  const rates = await getEhbRate(accountType);
  const breakdown = {};
  let totalEHB = 0;

  for (const { boss, rate } of rates) {
    for (const key in bosses) {
      if (toSnakeCase(key) === boss) {
        const kills = bosses[key]?.kills ?? 0;
        const ehb = kills / rate;
        breakdown[key] = +ehb.toFixed(2);
        totalEHB += ehb;
      }
    }
  }

  return {
    total: +totalEHB.toFixed(2),
    breakdown,
  };
}
