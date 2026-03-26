#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  run('docker compose down -v');
  run('docker compose up -d');
  run('pnpm --filter @kingdee/api prisma:migrate reset --force');
  run('pnpm --filter @kingdee/api seed');
  console.log('\n重置完成。');
} catch {
  console.error('\n重置失败：请确认 docker 与 pnpm 可用，再执行 node scripts/check-env.js 排查。');
  process.exit(1);
}
