import logger from '#utils/logger.js';

// Map of relevant item IDs to their names
const OSRS_ITEM_MAP = {
  30759: 'Soulflame horn',
  // Oathplate items
  30765: 'Oathplate Shards',
  30750: 'Oathplate helm',
  30753: 'Oathplate chest',
  30756: 'Oathplate legs',
  // Contracts
  30816: 'Contract of bloodied blows',
  30831: 'Contract of catalyst acquisition',
  30819: 'Contract of divine severance',
  30840: 'Contract of familiar acquisition',
  30822: 'Contract of forfeit breath',
  30810: 'Contract of glyphic attenuation',
  30837: 'Contract of harmony acquisition',
  30825: 'Contract of oathplate acquisition',
  30813: 'Contract of sensory clouding',
  30828: 'Contract of shard acquisition',
  30834: 'Contract of worm acquisition',
};

const OSRS_PRICES_API = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes in milliseconds

let cachedData = null;
let lastFetchTime = 0;

function parsePriceData(data) {
  const parsedData = {};
  for (const [itemId, itemName] of Object.entries(OSRS_ITEM_MAP)) {
    if (data[itemId]) {
      parsedData[itemName] = data[itemId].high;
    }
  }
  return parsedData;
}

export class OsrsPriceService {
  static async getYamaPrices() {
    if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
      logger.info('Using cached OSRS prices');
      return cachedData;
    }
    try {
      const response = await fetch(OSRS_PRICES_API);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const prices = parsePriceData(data.data);
      cachedData = prices;
      lastFetchTime = Date.now();
      logger.info('Fetched OSRS prices');
      return prices;
    } catch (error) {
      console.error('Error fetching OSRS prices:', error);
      if (cachedData) {
        logger.info('Returning cached OSRS prices due to error');
        return cachedData; // Return cached data if available
      }
      throw new Error('Failed to fetch OSRS prices');
    }
  }
}
