#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function has(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', '.env');
  console.log('已创建 .env');
}

if (!has('node -v')) {
  console.error('问题 -> 原因 -> 修复方案: Node 不可用 -> 未安装或 PATH 异常 -> 安装 Node >=20 并重开终端');
  process.exit(1);
}

if (!has('docker --version')) {
  console.error('问题 -> 原因 -> 修复方案: Docker 不可用 -> 未安装/未启动 -> 安装并启动 Docker 后重试');
  process.exit(1);
}

if (!has('pnpm -v')) {
  console.error('问题 -> 原因 -> 修复方案: pnpm 不可用 -> corepack 拉取失败或未预装 -> 配置代理后重试，或预装 pnpm 9.x');
  process.exit(1);
}

try {
  run('docker compose up -d');
  run('pnpm install');
  run('pnpm --filter @kingdee/api prisma:generate');
  run('pnpm --filter @kingdee/api prisma:migrate --name init');
  run('pnpm --filter @kingdee/api seed');
  console.log('\n初始化完成。可执行: pnpm dev');
} catch {
  console.error('\n初始化失败：请先执行 node scripts/check-env.js 获取环境阻塞详情。');
  process.exit(1);
}
