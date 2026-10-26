# Verifeed — Digital Shield

Verifeed explains warning signs in suspicious messages and social posts, with a clear next step in **English or Urdu**. Use the review studio to paste a message, or install the Chromium extension for explanations beside posts. Local text checks work without an account, API key, or cloud server. Optional Groq checks can review **text, images, voice/audio, and video**.

## Quickstart (no account needed)

Install **Node.js 22.13+** (Node 24 LTS also supported) and Git, then run:

```sh
git clone https://github.com/cr33p1ngp4ck3t/Verifeed.git
cd Verifeed
npm ci
npm test
npm start
```

Open **http://127.0.0.1:4317**. Paste a message and choose **Quick local check**, or try **A suspicious offer**. The result explains the warning signs and a next step. Try a normal message too. Choose Urdu from the language menu if preferred. **Flag for my review** saves a result on this device; it does not report anyone to a social platform.

No build step or database is needed. `npm ci` installs development tools and requires network access initially. Once Node and the source are available, `npm start` and `npm test` work without installing packages or using the network. The studio's local checks run in your browser; leave the local server running to serve its files. The practice feed is at **http://127.0.0.1:4317/demo**.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`. If port 4317 is already occupied, stop the other local instance or set `PORT` in `.env` and update the extension's **Server connection** to match.

## Start with Docker

With Docker and Compose installed, run this from the repository:

```sh
docker compose up --build --wait
```

Open **http://127.0.0.1:4317**. The first build downloads the Node image; later local text checks need no external service. The container runs as a non-root user with a read-only filesystem. Compose publishes port 4317 only on `127.0.0.1`. No `.env` is required. Stop it with `docker compose down`; view logs with `docker compose logs -f`.

For optional AI checks, set `GROQ_API_KEY` in `.env` and rerun `docker compose up -d`. Compose reads the provider and budget settings in that file. Its port and local access mode are fixed; `HOST`, `PORT`, `PUBLIC_URL`, and `VERIFEED_ACCESS_TOKEN` are for direct Node deployment. The image's `--container` argument permits listening on the container interface. Use the supplied Compose mapping for local use; a public deployment needs HTTPS and a server access code as described below.

## Optional AI checks

Copy `.env.example` to `.env` if `.env` does not already exist. Add your key in your editor:

```dotenv
GROQ_API_KEY=your_key_here
```

Restart `npm start` after editing `.env`. The key belongs only in this git-ignored file. Do not paste it into extension files. If a model is unavailable in your Groq account, change its model ID in `.env`.

On Windows/macOS, `npm run dev` watches `.env` and the server folder and restarts automatically when they change. Create `.env` first. Refresh the studio after adding the key. AI checks send the selected content to Groq and are subject to your provider account's limits and terms; local checks stay available without a key.

## Optional remote server

See [Oracle deployment and HTTPS setup](deploy/ORACLE.md) for the existing Oracle deployment and a public HTTPS configuration. New extension installs default to the local server on **4317**. Existing saved server addresses are preserved. To use the Oracle SSH tunnel, save **http://127.0.0.1:4318** under the extension's **Server connection**. Editing a local `.env` does not change a remote backend.

## Install the extension

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**, choose **Load unpacked**, and select this repo’s **extension** folder.
3. Refresh an open X/Twitter, Facebook, Instagram, LinkedIn, or practice feed tab.
4. Click the small **Verifeed** pill at the bottom-right of a post to open its review on the same tab. Local explanations and available media appear before any AI call.
5. Press **Analyze with AI** inside the panel to check scam risk and AI-like writing. Click **×** to close it; clicking outside or pressing Escape leaves it open.

For the studio and AI checks, keep `npm start` or Compose running. A new extension uses **http://127.0.0.1:4317** automatically. If you saved a different server before, use **Server connection** → **Save and test connection** to switch. Local feed badges work even when the backend is stopped.

The **AI writing & quality** section flags possible formulaic phrasing, repeated structures, generic claims, assistant-like wording, or explicit AI-writing disclosures. It shows source excerpts and remains separate from scam risk. Short text gets an insufficient-evidence result. These are writing observations, not proof of authorship or an AI percentage; see the [ACL study on social-post detection limits](https://aclanthology.org/2025.findings-acl.695/). Images, audio, and video can also be reviewed inside the panel. The toolbar still opens the full studio when wanted.

Post pills include a visible traffic-light circle: **green ✓** means no obvious local warning signs, **yellow !** means review is needed (including possible AI-style writing), and **red !** means strong scam warning signs. Unchecked media or insufficient information uses **yellow ? / Not checked**. Green is not a safety guarantee; red is not confirmed fraud. The popup includes the color legend.

## Website redirect warnings

Open the extension popup → **Website redirect warnings** → enable **Warn after website redirects**, then allow Chrome's website-access request. This optional feature works on HTTP/HTTPS websites beyond the four social platforms. It detects browser-reported HTTP and JavaScript/meta redirects; direct navigation and redirects inside embedded frames do not trigger it.

After a redirect, a small card on the **bottom-left** appears only when the destination's text contains a supported warning signal. Concrete scam patterns show **This site may be unsafe** with an excerpt and a next step. AI-like/formulaic writing gets a separate writing notice; it cannot make a site unsafe by itself. Ordinary password-entry instructions are not treated as phishing evidence. These checks do not establish a site's reputation or detect malware.

The check reads up to 6,000 characters of visible main-page text, excludes forms and editable inputs, and watches for delayed content for up to 20 seconds. It makes no AI calls and stores no navigation history. **×** dismisses the card for that document. **Review this page** opens the same-tab panel; only **Analyze with AI** sends its selected text to the configured backend. Turning the toggle off removes active warnings. Revoking the requested browser permissions also disables this feature.

See Chrome's [navigation events](https://developer.chrome.com/docs/extensions/reference/api/webNavigation) and [optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions) for the browser mechanisms used.

The popup scans the current feed when opened and can scan again, pause badges, change the badge language, and show private post flags. Installation also initializes supported feed tabs that are already open. Right-click selected text or an image to open a review. Media import is limited to supported platform CDNs; when a protected, streaming, blob, or oversized file cannot be imported, upload the original in the studio. Inline text checks require no backend or API key.

If badges are missing, reload Verifeed on the browser's extensions page, refresh the feed, and open the Verifeed popup. Make sure **Automatic local checks** is on. The popup reports how many posts were found, whether checks are paused, or whether the tab could not be accessed. For access errors, allow Verifeed access to the site in the browser's extension settings. If it reports no posts after scrolling, the current feed layout may not match an adapter; selected text can still be reviewed from the right-click menu.

The LinkedIn adapter handles both legacy class-based posts and `data-view-name="feed-full-update"` / activity `data-id` containers, including markers assigned after a post loads. These alternative containers are also used in [published LinkedIn filters](https://blog.georgovassilis.com/2025/05/27/hiding-suggested-linkedin-posts/) and a [post-permalink userscript](https://gist.github.com/wohfab/71e0785399afdf8f0b9eaeeaa9c58500). Browser tests cover representative layouts; a logged-in live feed still needs user verification.

For AI setup, put a valid Groq API key in `GROQ_API_KEY` in the backend `.env`, then restart `npm start` (or let `npm run dev` restart automatically). The studio distinguishes a loaded key from successfully checked access. A rejected-key error means Groq returned 401; a denied-access error means 403 and points to organization/project permissions. See [Groq error codes](https://console.groq.com/docs/errors) and [model permissions](https://console.groq.com/docs/model-permissions). A quick local check only looks for implemented scam patterns in text; it does not inspect images, verify facts, or guarantee that an unflagged post is safe.

## What each check does

| Content | Local work | On-demand AI work |
| --- | --- | --- |
| Message/caption | Explainable combinations of scam signals | GPT-OSS 120B reviews supplied evidence |
| Image/screenshot | Resize to ≤1024 px | Qwen observes visible content/OCR, then GPT-OSS assesses risk |
| Audio/voice note | Convert the first ≤60 seconds to 16 kHz mono WAV | Whisper transcribes speech, then GPT-OSS assesses the transcript |
| Video | Sample two frames within the first 60 seconds; extract audio if supported | Qwen checks frames, Whisper transcribes available audio, GPT-OSS assesses combined evidence |

Uploads accept JPG/PNG/WebP and browser-decodable audio/video. Files are limited to 40 MB and clips to two minutes; only the first minute is prepared. The extension imports at most one attachment, up to 9 MB, per post review. Frame times, audio coverage, and omissions appear in the result. Unsupported media produces an explicit message, never a fabricated check.

**Scam risk is separate from media origin.** Green means no obvious signs in the checked material; yellow means pause and check; red means strong warning signs; gray means insufficient information. These models do not prove whether a picture is AI-generated, whether a video is a deepfake, who a speaker is, or whether a voice is cloned. Media origin always remains **unverified**. Links are inspected as text; no URL reputation service or independent fact checking is implemented.

## Accessibility and privacy

- English/Urdu interface and local explanations; AI responds in the requested language. Text accompanies risk colors. The studio supports small screens, keyboards and reduced motion.
- **Listen** uses a matching device speech voice. Urdu requires an installed Urdu voice; the app reports when one is unavailable. It does not silently use an English voice for Urdu or call a paid speech service.
- Scrolling makes no AI calls. File preparation happens on the device. Only an explicit AI check sends selected content to Groq.
- The key stays in the selected backend. Direct Node startup binds to `127.0.0.1:4317` by default; Compose publishes only to loopback. The server checks origins/hosts, validates media and provider output, and never fetches arbitrary supplied URLs. Oracle access uses an encrypted SSH tunnel.
- Drafts are held in bounded memory, expire after five minutes, and are consumed once. Analysis results are reused for 30 minutes; duplicate submissions share an in-flight request. Nothing is written to a server database or content log.
- Saved check summaries live in browser local storage. Feed flags live in extension storage. Delete them in their respective UI. Neither submits a platform report.
- Provider-side data handling follows your Groq account and policies; this prototype does not promise zero retention at the provider.

The demo has conservative per-process request/token budgets, one active analysis at a time, timeouts, and provider-limit cooldowns. Counters reset when the backend restarts. Optional public HTTPS mode requires a separate server access code and uses one-time connection tickets for studio sign-in. Individual user accounts and durable quotas are future work. Set `ALLOWED_EXTENSION_ID` to restrict extension access to your extension ID if desired.

## Development and tests

```sh
npm ci
npm run check
npm run lint
npm test
npm run test:coverage
npx playwright install chromium
npm run test:ui
```

On Linux, install browser system libraries with `npx playwright install --with-deps chromium`. All automated suites use isolated local servers and test substitutes for Groq. They require no provider account, live token, Oracle server, or authenticated social account. `npm run test:local` specifically checks the account-free studio workflow. The other individual commands are `test:browser`, `test:extension`, `test:remote`, `test:panel`, and `test:website`.

`test:coverage` uses Node's built-in V8 coverage and enforces **90% lines, 80% branches, and 80% functions** for the server and extension modules loaded by the Node tests. It is not whole-app coverage: browser UI and media paths are exercised separately by `test:ui`. Add a focused regression test with each behavior change; keep unrelated formatting out of feature commits.

[CI](.github/workflows/ci.yml) runs on pushes and pull requests: Node 22/24 checks, lint, unit coverage, dependency audit, all browser suites, and a container startup check. A failed command fails its job. Repository owners can require these checks in GitHub branch protection. [Dependabot](.github/dependabot.yml) checks npm, Actions, and the Node container image weekly. ESLint checks correctness; `.editorconfig` keeps basic editor formatting consistent.

The browser suite loads the actual Manifest V3 extension, exercises media preparation and analysis, and tests all four adapters against representative DOM fixtures. It uses a **test-only Groq substitute**, never live tokens. Screenshots and results are written to `artifacts/`. It can reuse a cached Playwright Chromium, or use `VERIFEED_BROWSER_EXECUTABLE` to specify one (`NOVA_BROWSER_EXECUTABLE` remains supported).

Set browser overrides in your shell, not `.env`: `VERIFEED_BROWSER_EXECUTABLE` is an optional absolute Chromium path; `NOVA_BROWSER_EXECUTABLE` is its legacy alias; `NOVA_TEST_EXTENSION` optionally selects an extension folder for `test:extension`. Windows supplies `LOCALAPPDATA` automatically for cache discovery.

## Health and logs

`GET /api/health` returns `{ "status": "ok", "uptime": ... }` without calling Groq or exposing configuration. It reports process liveness, not provider availability. `/api/status` reports setup/access state. Docker uses the health endpoint to detect startup failures.

Direct startup writes JSON records to stdout with timestamps, levels, known route names, status codes and elapsed milliseconds. Request bodies, arbitrary paths, query strings, draft IDs, cookies, authorization headers, and provider responses are excluded. Use `docker compose logs` or your service manager to inspect the records.

**Live verification (September 12, 2026):** text, image, audio, and video checks all returned successful Groq results through the Oracle backend. Whisper transcribed the audio and video speech; vision inspected the image and two sampled video frames. Results are recorded in `artifacts/live-check-results.json`, separately from the automated tests.

**Validation limits:** authenticated live feeds were unavailable for testing; check the adapters against your logged-in accounts. Social sites change their DOM. Studio uploads/paste remain available when feed extraction is unsupported. Media origin remains unverified.

The practice feed includes fictional normal posts, advance-fee offers, a voice message, a poster, a narrated video, scam-awareness advice, and a harmless AI-art caption. **Add a new post** demonstrates dynamic scanning. App results come from local rules or actual configured provider calls; there is no canned AI-result mode in the product.

Practice assets are included. To regenerate them on Windows:

```powershell
powershell -NoProfile -File scripts/generate-audio.ps1
node scripts/generate-visual-assets.mjs
```

English audio uses the installed device voice. Graphics and video are locally generated fictional training material. No third-party photo, font or media service is needed.

## Project map

- `PLAN.md` — adjusted multimodal scope and implementation plan.
- `extension/` — Manifest V3 extension, four adapters, shared local rules.
- `web/` — studio, media preparation, translations and practice feed.
- `server/` — backend, Groq pipeline, server access, validation and budgets.
- `deploy/` — Oracle service, tunnel instructions, and optional HTTPS configuration.
- `tests/` — rule, server, pipeline and browser checks.

Model defaults were checked against [Groq vision](https://console.groq.com/docs/vision), [speech-to-text](https://console.groq.com/docs/speech-to-text), and [GPT-OSS documentation](https://console.groq.com/docs/model/openai/gpt-oss-120b) on September 12, 2026. The original challenge and team idea remain in `prompt.txt`.
