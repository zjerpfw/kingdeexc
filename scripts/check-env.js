#!/usr/bin/env node
const { execSync } = require('child_process');

function safe(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

const node = process.version;
const pnpm = safe('pnpm -v');
const docker = safe('docker --version');
const compose = safe('docker compose version');

console.log('环境检查结果:');
console.log('- Node:', node, '(建议 >= 20)');
console.log('- pnpm:', pnpm || '未检测到（或网络受限）', '(建议 9.x)');
console.log('- Docker:', docker || '未检测到');
console.log('- Docker Compose:', compose || '未检测到');

if (!pnpm) {
  console.log('\n提示：当前环境可能无法联网拉取 pnpm（corepack 受限）。');
}
