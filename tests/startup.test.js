import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const entry = fileURLToPath(new URL('../server/index.js', import.meta.url));

test('public binding still requires explicit public deployment configuration', async () => {
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, HOST: '0.0.0.0', PORT: '4317', PUBLIC_URL: '', VERIFEED_ACCESS_TOKEN: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  const [code] = await once(child, 'exit');
  assert.notEqual(code, 0);
  assert.match(stderr, /Set PUBLIC_URL and VERIFEED_ACCESS_TOKEN/);
});

test('container startup works without an account and emits private structured logs', { timeout: 15000 }, async t => {
  const cwd = await mkdtemp(join(tmpdir(), 'verifeed-startup-'));
  // Use a reserved socket to choose a port without touching the user's running app.
  const { createServer } = await import('node:net');
  const reservation = createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, [entry, '--container'], {
    cwd,
    env: { ...process.env, HOST: '0.0.0.0', PORT: String(port), PUBLIC_URL: '', VERIFEED_ACCESS_TOKEN: '', GROQ_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    await rm(cwd, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${port}`;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start: ${stderr}`)), 5000);
    child.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited (${code}): ${stderr}`)); });
  });
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  assert.equal((await (await fetch(`${base}/api/status`)).json()).configured, false);
  assert.match(await (await fetch(base)).text(), /Your digital shield/);
  const response = await fetch(`${base}/api/analyze?private=PRIVATE_QUERY`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer PRIVATE_TOKEN' },
    body: JSON.stringify({ text: 'PRIVATE_MESSAGE' }),
  });
  assert.equal(response.status, 503);
  // A later response ensures the previous response's finish event has run.
  await fetch(`${base}/api/health`);
  const records = stdout.trim().split(/\r?\n/).map(line => JSON.parse(line));
  assert.ok(records.some(record => record.event === 'listening' && record.host === '0.0.0.0'));
  assert.ok(records.some(record => record.event === 'request' && record.route === '/api/analyze' && record.status === 503 && record.level === 'error'));
  assert.ok(records.every(record => Number.isFinite(Date.parse(record.timestamp))));
  assert.doesNotMatch(stdout + stderr, /PRIVATE_QUERY|PRIVATE_TOKEN|PRIVATE_MESSAGE/);
});
