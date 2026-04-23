---
name: chrome-debug-direct
description: Connect to an already-running Chrome instance started with remote debugging, especially the local gchromeDebug alias on port 9222. Use when the user wants Codex to inspect or automate their existing Chrome session without launching a new browser, or when validating Chrome DevTools Protocol, chrome-devtools-mcp --browserUrl, Playwright CDP, or direct /json endpoints.
---

# Chrome Debug Direct

Use this skill when the user wants to connect to an existing Chrome process, not start another one.

The expected local setup is:

```bash
gchromeDebug
```

which expands to Chrome with:

```bash
--remote-debugging-port=9222 --user-data-dir=$HOME/.chrome-mcp-profile
```

## Recreate the alias on a new Mac

Add these aliases to `~/.zshrc` or another shell startup file:

```bash
alias gchromeDebug='"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --no-first-run --user-data-dir=$HOME/.chrome-mcp-profile --window-size=1920,1080'
alias gchromeCheck='lsof -i :9222 -sTCP:LISTEN 2>/dev/null && echo "Chrome debug port 9222 is active" || echo "Chrome debug port 9222 is NOT active - run gchromeDebug first"'
alias gchromePW='npx @playwright/mcp --cdp-endpoint http://localhost:9222 --viewport-size 1920x1080'
alias gchromePWSSE='npx @playwright/mcp --cdp-endpoint http://localhost:9222 --viewport-size 1920x1080 --port 8931'
alias gchromeSsh='ssh -R 9222:localhost:9222 guozhicheng.0@dev_box'
```

Then reload the shell:

```bash
source ~/.zshrc
```

Start the browser with:

```bash
gchromeDebug
```

This creates or reuses a dedicated Chrome profile at `$HOME/.chrome-mcp-profile`. It intentionally avoids the default Chrome profile so the debug-enabled session is stable and separate from everyday browsing.

If Chrome is installed somewhere else, adjust the executable path before saving the alias.

## Hard rule

Do not launch Chrome for this workflow. Avoid commands or tools that create their own browser/profile unless the user explicitly asks for a new instance.

Avoid:

```bash
npx chrome-devtools-mcp@latest
npx chrome-devtools-mcp@latest --port=9222
```

Those can start or target a separate browser flow and are not proof that the user's `gchromeDebug` instance is connected.

## Fast validation

First verify the existing debug endpoint:

```bash
curl -fsS --max-time 2 http://127.0.0.1:9222/json/version
curl -fsS --max-time 2 http://127.0.0.1:9222/json/list
```

Success means Chrome is reachable over CDP. The `Browser` field identifies the Chrome version and `webSocketDebuggerUrl` gives the browser-level WebSocket endpoint.

For an AI-friendly check:

```bash
node /Users/bytedance/.codex/skills/chrome-debug-direct/scripts/check_existing_chrome.js
```

Use `--endpoint http://host:port` if the port differs.

On a freshly cloned backup, run the script from that skill directory instead:

```bash
node chrome-debug-direct/scripts/check_existing_chrome.js
```

## Connecting tools to the existing instance

For Chrome DevTools MCP, connect by browser URL:

```bash
npx chrome-devtools-mcp@latest --browserUrl http://127.0.0.1:9222
```

or by the WebSocket URL from `/json/version`:

```bash
npx chrome-devtools-mcp@latest --wsEndpoint ws://127.0.0.1:9222/devtools/browser/<id>
```

For Playwright MCP, use the existing CDP endpoint:

```bash
npx @playwright/mcp --cdp-endpoint http://127.0.0.1:9222 --viewport-size 1920x1080
```

## Direct CDP fallback

If MCP tooling is ambiguous, use the `/json/*` endpoints directly:

- `/json/version`: browser metadata and browser WebSocket
- `/json/list`: current pages, iframes, and page WebSocket endpoints
- `/json/protocol`: supported CDP domains and methods

When a page WebSocket is needed, use an existing page from `/json/list`; do not call `/json/new` unless the user explicitly allows opening a tab.

## Troubleshooting

- If `curl http://127.0.0.1:9222/json/version` fails, ask the user to run `gchromeDebug` or check that the alias is still alive.
- If a tool shows `about:blank` but `/json/list` shows the user's tabs, the tool is attached to a different browser/session.
- If multiple MCP server processes are present, prefer the raw `/json/*` endpoint result as the source of truth.
- If connecting from another machine, tunnel the port first, for example with the user's `gchromeSsh` alias, then validate the local forwarded endpoint.
