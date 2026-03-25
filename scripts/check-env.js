#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

function safe(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch {
    return null;
  }
}

const node = process.version;
const pnpm = safe('pnpm -v');
const docker = safe('docker --version');
const compose = safe('docker compose version');
const envExists = fs.existsSync('.env');
const registryReachable = safe('node -e "fetch(\'https://registry.npmjs.org/pnpm\').then(r=>console.log(r.status)).catch(()=>process.exit(1))"');

console.log('环境检查结果:');
console.log('- Node:', node, '(建议 >= 20)');
console.log('- pnpm:', pnpm || '未检测到（或网络受限）', '(建议 9.x)');
console.log('- Docker:', docker || '未检测到');
console.log('- Docker Compose:', compose || '未检测到');
console.log('- .env:', envExists ? '存在' : '缺失（可从 .env.example 复制）');
console.log('- npm registry 可达性:', registryReachable ? `可达(HTTP ${registryReachable})` : '不可达');

console.log('\n常见阻塞与建议:');
if (!pnpm) console.log('1) pnpm 不可用：检查代理/网络，或预装 pnpm 9.x 后重试。');
if (!docker) console.log('2) Docker 不可用：请先安装并启动 Docker Desktop/Engine。');
if (!envExists) console.log('3) .env 缺失：执行 cp .env.example .env。');
if (!registryReachable) console.log('4) npm registry 不可达：检查 HTTPS_PROXY/HTTP_PROXY 与证书配置。');

if (!pnpm || !docker || !envExists) process.exitCode = 1;
