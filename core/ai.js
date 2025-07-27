const EMULATOR_FETCH = require('node-fetch');

let CONFIG_RUN = { isUnstable: false, isBun: false, isNode: true }; // default

function setConfigRun(config) {
  CONFIG_RUN = config || CONFIG_RUN;
}

function createFetchWithTimeout(timeoutMs) {
  return async (url, options = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await EMULATOR_FETCH(url, {
        ...options,
        signal: controller.signal
      });
      return res;
    } finally {
      clearTimeout(id);
    }
  };
}

// Decide timeout based on runtime
const TIMEOUT = CONFIG_RUN.isUnstable ? 50000 : 30000;
const fetch = createFetchWithTimeout(TIMEOUT);

function isConfigTest(obj) {
  return obj && typeof obj === 'object' && obj.CONFIG_TEST === true;
}

async function testCloudflare(config) {
  const { accountid, API_TOKEN, MODEL } = config;
  const start = Date.now();
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountid}/ai/run/${MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: "hello test" }]
        }),
      }
    );
    const json = await res.json();
    return {
      type: "CLOUDFLARE",
      status: json?.result ? "success" : "response_error",
      time: Date.now() - start,
      response: json,
      code: json?.result ? undefined : "FORBIDDEN_0x100404"
    };
  } catch (err) {
    return {
      type: "CLOUDFLARE",
      status: "error",
      time: Date.now() - start,
      message: err.message,
      code: "FORBIDDEN_0x010404"
    };
  }
}

async function testGemini(config) {
  const { key } = config;
  const start = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: "hello test" }],
            },
          ],
        }),
      }
    );
    const json = await res.json();
    return {
      type: "GEMINI",
      status: json?.candidates ? "success" : "response_error",
      time: Date.now() - start,
      response: json,
      code: json?.candidates ? undefined : "FORBIDDEN_0x100404"
    };
  } catch (err) {
    return {
      type: "GEMINI",
      status: "error",
      time: Date.now() - start,
      message: err.message,
      code: "FORBIDDEN_0x010404"
    };
  }
}

async function ai(config, type = 'CLOUDFLARE') {
  if (isConfigTest(config)) {
    const results = [];

    if (config.cloudflare) {
      const res = await testCloudflare(config.cloudflare);
      results.push(res);
    }

    if (config.gemini) {
      const res = await testGemini(config.gemini);
      results.push(res);
    }

    return {
      tested: results.length,
      results,
    };
  }

  if (type === 'CLOUDFLARE') {
    const { accountid, API_TOKEN } = config;
    return async (model, prompt) => {
      const body = typeof prompt === 'string'
        ? { messages: [{ role: 'user', content: prompt }] }
        : prompt;

      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountid}/ai/run/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      return res.json();
    };
  }

  if (type === 'GEMINI') {
    const { key } = config;
    return async (model, prompt) => {
      const body = typeof prompt === 'string'
        ? {
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
          }
        : prompt;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      return res.json();
    };
  }

  throw new Error(`Unsupported AI type: ${type}`);
}

ai.CONFIG = {
  version: '0.0.4',
  name: 'FORBIDDEN_A.I'
};

ai.setConfigRun = setConfigRun;
module.exports = ai;
