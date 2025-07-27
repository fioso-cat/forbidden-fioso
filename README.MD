# ForbiddenFioso

Welcome to **ForbiddenFioso**
This package is developed by **Forbidden** & **Fioso**.

## 📦 Install

```bash
npm i git+https://github.com/fioso-cat/forbidden-fioso.git
```

## 🚀 Features

### 🔮 Store API

```js
const store = await Fioso.store({
    type: "", //"GAG", "BLOXFRUIT", "WEATHER"
    apitype: "" 
    
});
/*
GAG: "GROWGARDENGG", "GAMERBERGS"
BLOXFRUIT: "FANDOM", "GAMERBERGS"
WEATHER: "GROWGARDENGG"
*/

```

Returns a JSON structured response:

* Weather: `None` → Duration: `Unknown` *(Weather inactive or undefined)*

### 🤖 AI API

```js
const AI_CONFIG = await Fioso.ai({
    key: 'YOUR_GEMINI_KEY'
    // or use Cloudflare config
    accountid: 'YOUR_ACCOUNT_ID',
    API_TOKEN: 'YOUR_TOKEN'
});

const CHAT_NEW = await AI_CONFIG('Model', 'your_prompt_here');
```

Returns: JSON AI response depending on provider used.

## ❗ Error Codes

| Code                | Meaning                         |
| ------------------- | ------------------------------- |
| FORBIDDEN\_0x000202 | Data parsed but invalid         |
| FORBIDDEN\_0x010404 | Fetch error or unknown response |

Full Code Error as ERRCODE.md, Post Issues as Github: [forbidden_fioso](https://github.com/fioso-cat/forbidden-fioso/issues)
---

## 👑 Author

Developed with 🔥 by **Forbidden** & **Fioso**
Fixes and contributions with ❤️ by **ChatGPT**

---
