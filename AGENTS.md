This repo uses pnpm@9.12.3.

Install dependencies from the repository root only.
Do not run npm install.
Do not run install commands inside apps/* or packages/*.

Setup:
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm install --frozen-lockfile

Environment:
If .env is missing and .env.example exists, copy .env.example to .env.

Build:
pnpm build

Test:
pnpm test

Lint:
pnpm lint
