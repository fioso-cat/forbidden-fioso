// index.js (Forbidden Fioso Config Inject System)
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const VERSION = 'v0.0.5';
const white = chalk.white;
const cyan = chalk.cyan;
const boldCyan = chalk.cyan.bold;
const red = chalk.red;
const gray = chalk.gray;
const isBun = typeof Bun !== 'undefined';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log(white(`[Forbidden]: ${VERSION}`));
  console.log(boldCyan('[Forbidden] Loading modules...'));

  if (isBun) {
    console.log(red('[Corruption Detected] You are using Bun... Why?'));
    await delay(800);
    console.log(chalk.bgRed.black(' [FORBIDDEN] Reality is... unstable with Bun. '));
    console.log(gray(' ⚠️  Fetch operations may behave strangely.'));
    await delay(1000);
    console.log(chalk.hex('#550000')(' 卍 Fofioso? Skibidi unstable corruption mode enabled...'));
  } else {
    console.log(red('[Corruption Detected] Really?? You dare run this? ⚠️'));
    console.log(chalk.bgRed.black(' [FORBIDDEN] Reality is... falling apart. '));
    console.log(chalk.hex('#550000')(' 卍 Fofioso ?'));
  }
})();

const getRuntimeEnv = () => {
  const isBun = typeof Bun !== 'undefined';
  const isNode = typeof process !== 'undefined' && process.release?.name === 'node';
  const isCLI = require.main === module;
  const isWorker = typeof WorkerGlobalScope !== 'undefined';

  return {
    isBun,
    isNode,
    isCLI,
    isWorker,
    isUnstable: isBun
  };
};

let CONFIG_RUN = getRuntimeEnv();
const Fioso = { version: VERSION, CONFIG_RUN };

const coreDir = path.join(__dirname, 'core');
const files = fs.readdirSync(coreDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const name = path.basename(file, '.js');
  if (name === 'reportsummary') continue;

  try {
    const mod = require(`./core/${file}`);

    if (typeof mod === 'function') {
      if (!mod.CONFIG) {
        mod.CONFIG = {
          version: mod.version || 'unknown',
          name: mod.name || file
        };
      }
      mod.CONFIG_RUN = CONFIG_RUN;
      if (typeof mod.setConfigRun === 'function') {
        mod.setConfigRun(CONFIG_RUN);
      }
      Fioso[name] = mod;
    } else {
      const fallback = async () => ({
        error: red(`[Forbidden]: "${name}" is not a function.`)
      });
      fallback.version = 'unknown';
      fallback.name = file;
      fallback.CONFIG_RUN = CONFIG_RUN;
      Fioso[name] = fallback;
    }
  } catch (err) {
    const errorFunc = async () => ({
      error: red(`[Forbidden]: Failed to load "${name}": ${err.message}`)
    });
    errorFunc.version = 'unknown';
    errorFunc.name = file;
    errorFunc.CONFIG_RUN = CONFIG_RUN;
    Fioso[name] = errorFunc;
  }
}

Fioso.REPORT = require('./core/reportsummary');

module.exports = Fioso;
