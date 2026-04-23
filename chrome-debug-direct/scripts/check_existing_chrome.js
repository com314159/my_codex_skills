#!/usr/bin/env node

const http = require("node:http");

const args = process.argv.slice(2);
let endpoint = "http://127.0.0.1:9222";
let evalPage = false;

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--endpoint" && args[i + 1]) {
    endpoint = args[i + 1];
    i += 1;
  } else if (args[i] === "--eval-page") {
    evalPage = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: check_existing_chrome.js [--endpoint http://127.0.0.1:9222] [--eval-page]");
    process.exit(0);
  }
}

function getJson(pathname) {
  const url = new URL(pathname, endpoint);
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`${url.href} returned HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`${url.href} returned invalid JSON: ${error.message}`));
        }
      });
    });
    req.on("timeout", () => {
      req.destroy(new Error(`${url.href} timed out`));
    });
    req.on("error", reject);
  });
}

function evaluatePage(pageWsUrl) {
  return new Promise((resolve, reject) => {
    if (typeof WebSocket !== "function") {
      reject(new Error("This Node runtime does not provide global WebSocket"));
      return;
    }

    const ws = new WebSocket(pageWsUrl);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("WebSocket evaluation timed out"));
    }, 3000);

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({
        id: 1,
        method: "Runtime.evaluate",
        params: {
          expression: "({ title: document.title, href: location.href })",
          returnByValue: true,
        },
      }));
    });

    ws.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.id !== 1) return;
      clearTimeout(timer);
      ws.close();
      if (payload.error) {
        reject(new Error(payload.error.message || JSON.stringify(payload.error)));
        return;
      }
      resolve(payload.result && payload.result.result && payload.result.result.value);
    });

    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("WebSocket connection failed"));
    });
  });
}

(async () => {
  const version = await getJson("/json/version");
  const targets = await getJson("/json/list");
  const pages = targets.filter((target) => target.type === "page");

  const result = {
    ok: true,
    endpoint,
    browser: version.Browser,
    protocolVersion: version["Protocol-Version"],
    browserWebSocketDebuggerUrl: version.webSocketDebuggerUrl,
    targetCount: targets.length,
    pages: pages.map((page) => ({
      id: page.id,
      title: page.title,
      url: page.url,
      webSocketDebuggerUrl: page.webSocketDebuggerUrl,
    })),
  };

  if (evalPage && pages[0] && pages[0].webSocketDebuggerUrl) {
    result.firstPageRuntime = await evaluatePage(pages[0].webSocketDebuggerUrl);
  }

  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    endpoint,
    error: error.message,
  }, null, 2));
  process.exit(1);
});
