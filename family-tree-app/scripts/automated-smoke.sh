#!/usr/bin/env bash
# Pre-device gate: same checks as CI (minus emulator Maestro).
set -euo pipefail
cd "$(dirname "$0")/.."
npm run typecheck
npm test -- --passWithNoTests
npm run test:maestro:contracts
echo "Automated smoke gate passed."
