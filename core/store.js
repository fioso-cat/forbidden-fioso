const EMULATOR_FETCH = require('node-fetch');

const fetch = ((EMULATED => {
    return async (url, options = {}) => {
        return await EMULATED(url, options);
    };
})(EMULATOR_FETCH));

const cleanSeeds = (list) => list.map((item) => ({
  name: item.name,
  amount: item.value,
}));
const cleanEggs = (list) => list.map((item) => ({
  name: item.name,
  amount: item.value,
}));
const parseWeather = (seenList) => {
  const weatherNames = ["rain", "windy", "heatwave", "tornado", "thunderstorm", "auroraborealis", "sungod"];
  return seenList.filter((item) => weatherNames.includes(item.name?.toLowerCase()));
};

const cleanGag_growgardengg = (data) => {
  if (!data || typeof data !== "object") return null;
  return {
    seed: cleanSeeds(data.seedsStock || []),
    cosmetic: data.cosmeticsStock || [],
    gear: data.gearStock || [],
    eggs: cleanEggs(data.eggStock || []),
    weather: parseWeather(data.lastSeen || []),
  };
};

const cleanGag_gamerbergs = (data) => {
  try {
    if (!data || !Array.isArray(data.data)) return null;

    const entry = data.data[0];
    if (!entry) return null;

    const parseList = (obj) =>
      Object.entries(obj || {})
        .filter(([_, v]) => parseInt(v) > 0)
        .map(([k, v]) => ({ name: k, amount: parseInt(v) }));

    const parseEggs = (arr) =>
      Array.isArray(arr)
        ? arr.filter((e) => e.quantity > 0).map((e) => ({ name: e.name, amount: e.quantity }))
        : [];

    return {
      seed: parseList(entry.seeds),
      cosmetic: parseList(entry.cosmetic),
      gear: parseList(entry.gear),
      eggs: parseEggs(entry.eggs),
      weather: {
        weather: entry.weather?.type || "Unknown",
        duration: entry.weather?.duration || "Unknown",
      },
    };
  } catch (err) {
    return null;
  }
};

const cleanBloxFruit = (data) => {
  if (!data || typeof data !== "object" || !Array.isArray(data.data)) return null;

  const normal = [];
  const mirage = [];

  for (const session of data.data) {
    if (Array.isArray(session.normalStock)) {
      for (const item of session.normalStock) {
        if (item?.onSale && item?.name) normal.push(item.name);
      }
    }
    if (Array.isArray(session.mirageStock)) {
      for (const item of session.mirageStock) {
        if (item?.onSale && item?.name) mirage.push(item.name);
      }
    }
  }

  return {
    normal: [...new Set(normal)],
    mirage: [...new Set(mirage)],
  };
};

const cleanBloxFruitWiki = (rawText) => {
  const match = rawText.match(/\{\{Stock\/Main[\s\S]+?\}\}/);
  if (!match) return null;

  const template = match[0];

  const extract = (key) => {
    const reg = new RegExp(`\\|${key}\\s*=\\s*([^|\\n]+)`, 'i');
    const m = template.match(reg);
    if (!m) return [];
    return m[1].split(',').map(x => x.trim()).filter(Boolean);
  };

  return {
    current: extract('Current'),
    last: extract('Last'),
    before_last: extract('Before'),
  };
};

const apiMap = {
  GAG: {
    "GROWGARDENGG": {
      Request: { url: "https://growagarden.gg/api/stock", headers: {} },
      JsonCheck: null,
      CleanFunc: cleanGag_growgardengg,
    },
    "GAMERBERGS": {
      Request: {
        url: "https://www.gamersberg.com/api/grow-a-garden/stock",
        headers: {
          Referer: "https://www.gamersberg.com/grow-a-garden/stock",
          "User-Agent": "Mozilla/5.0",
        },
      },
      JsonCheck: null,
      CleanFunc: cleanGag_gamerbergs,
    },
  },
  BLOXFRUIT: {
    "GAMERBERGS": {
      Request: {
        url: "https://www.gamersberg.com/api/blox-fruits/stock",
        headers: {
          Referer: "https://www.gamersberg.com/blox-fruits/stock",
          "User-Agent": "Mozilla/5.0",
        },
      },
      JsonCheck: null,
      CleanFunc: cleanBloxFruit,
    },
    "FANDOM": {
      Request: {
        url: "https://blox-fruits.fandom.com/wiki/Blox_Fruits_Stock?action=edit",
        headers: {
          "User-Agent": "Mozilla/5.0"
        },
      },
      JsonCheck: null,
      CleanFunc: cleanBloxFruitWiki,
    }
  },
  WEATHER: {
    "GROWGARDENGG": {
      Request: { url: "https://growagarden.gg/api/weather", headers: {} },
      JsonCheck: null,
      CleanFunc: parseWeather,
    }
  }
};

function isConfigTest(obj) {
  return obj && typeof obj === 'object' && obj.CONFIG_TEST === true;
}

async function runSingleTest(type, apitype) {
  const entry = apiMap[type]?.[apitype];
  if (!entry) {
    return { type, apitype, status: "invalid", time: 0 };
  }

  const { Request, JsonCheck, CleanFunc } = entry;
  const start = Date.now();
  try {
    const res = await fetch(Request.url, { headers: Request.headers });
    const rawData = await res.text();
    let data = JsonCheck ? JSON.parse(rawData)[JsonCheck] : (apitype === "FANDOM" && type === "BLOXFRUIT" ? rawData : JSON.parse(rawData));
    const cleaned = CleanFunc(data);

    if (!data || !cleaned) {
      return {
        type, apitype, status: "fail_data", time: Date.now() - start,
        code: "FORBIDDEN_0x100404"
      };
    }

    return {
      type, apitype, status: "success", time: Date.now() - start,
      sample: cleaned
    };
  } catch (err) {
    return {
      type, apitype, status: "error", time: Date.now() - start,
      code: "FORBIDDEN_0x010404",
      message: err.message
    };
  }
}

async function store(...args) {
  if (isConfigTest(args[0])) {
    const results = [];

    for (const [type, entries] of Object.entries(apiMap)) {
      for (const apitype of Object.keys(entries)) {
        const result = await runSingleTest(type, apitype);
        results.push(result);
      }
    }

    return {
      tested: results.length,
      results,
    };
  }

  const config = args[0];
  const type = config?.type?.toUpperCase?.();
  const apitype = config?.apitype?.toUpperCase?.();

  const entry = apiMap[type]?.[apitype];
  if (!entry) {
    return {
      error: `[Forbidden]: Invalid type/apitype combo`,
      available: Object.fromEntries(Object.entries(apiMap).map(([k, v]) => [k, Object.keys(v)]))
    };
  }

  const { Request, JsonCheck, CleanFunc } = entry;
  try {
    const res = await fetch(Request.url, { headers: Request.headers });
    const rawData = await res.text();
    const data = JsonCheck ? JSON.parse(rawData)[JsonCheck] : (apitype === "FANDOM" && type === "BLOXFRUIT" ? rawData : JSON.parse(rawData));
    if (!data) {
      return {
        error: `[Forbidden]: This API is unstable or returned no data. Use different apitype.`,
        code: "FORBIDDEN_0x100404"
      };
    }

    const cleaned = CleanFunc(data);
    if (!cleaned || typeof cleaned !== 'object') {
      return { error: "[Forbidden]: Data parsed but not valid", code: "FORBIDDEN_0x000202" };
    }

    return cleaned;
  } catch (err) {
    return { error: `[Forbidden]: Fetch error - ${err.message}` , code: "FORBIDDEN_0x010404" };
  }
}

store.CONFIG = {
  version: '0.0.5',
  name: 'FORBIDDEN_STOCK'
}
module.exports = store;
