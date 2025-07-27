const fetch = require('node-fetch');
const chalk = require('chalk');

const white = (text) => chalk.hex('#ffffff')(text);
const cyan = (text) => chalk.hex('#00ffff')(text);
const boldCyan = (text) => chalk.hex('#00ffff').bold(text);

const VERSION = 'v0.0.5';

const runWithTimeout = async (fn, timeoutMs = 10000) => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ status: 'timeout', code: 'FORBIDDEN_0x000408' });
    }, timeoutMs);

    fn().then((result) => {
      clearTimeout(timeout);
      resolve({ status: 'success', result });
    }).catch((err) => {
      clearTimeout(timeout);
      resolve({ status: 'error', error: err.message });
    });
  });
};

const testNetwork = async () => {
  try {
    const res = await fetch('https://google.com', { timeout: 5000 });
    return { status: res.ok ? 'online' : 'offline' };
  } catch {
    return { status: 'offline', code: 'FORBIDDEN_0x000404' };
  }
};

async function REPORT(testFunctions = {}) {
  console.log(boldCyan('[Test] Running Report Summary...'));

  const network = await testNetwork();

  const functionReports = await Promise.all(
    Object.entries(testFunctions).map(async ([name, fn]) => {
      if (typeof fn !== 'function') {
        return {
          module: name,
          status: 'error',
          error: '[Forbidden]: Provided test is not a function',
          code: 'FORBIDDEN_0x000400'
        };
      }
      const res = await runWithTimeout(() => fn());
      return {
        module: name,
        ...res
      };
    })
  );

  const isAllGood =
    network.status === 'online' &&
    functionReports.every((r) => r && (r.status === 'success' || r.status === 'response_error'));

  const report = {
    is_network_ready: network.status === 'online',
    network,
    functions: functionReports,
    stable: isAllGood,
    code: isAllGood ? null : network.code || functionReports.find(r => r.code)?.code || 'FORBIDDEN_0x000202'
  };

  console.log(cyan('\n[Report Summary]:'));
  console.dir(report, { depth: null, colors: true });

  return report;
}

module.exports = REPORT;
