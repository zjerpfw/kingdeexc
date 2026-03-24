#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', '.env');
  console.log('已创建 .env');
}

try {
  run('docker compose up -d');
  run('pnpm install');
  run('pnpm --filter @kingdee/api prisma:generate');
  run('pnpm --filter @kingdee/api prisma:migrate --name init');
  run('pnpm --filter @kingdee/api seed');
  console.log('\n初始化完成。可执行: pnpm dev');
} catch (e) {
  console.error('\n初始化失败，请先执行 scripts/check-env.js 排查环境。');
  process.exit(1);
}
