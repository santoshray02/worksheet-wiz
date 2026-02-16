#!/usr/bin/env bash
set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

PORT="${PORT:-3000}"
HOST="${HOST:-localhost}"

usage() {
  cat <<EOF
Usage: ./manage.sh <command>

Commands:
  dev         Start development server on http://$HOST:$PORT
  build       Build for production
  preview     Preview production build on http://$HOST:$PORT
  test        Run all tests
  test:watch  Run tests in watch mode
  check       Run svelte-check type checking
  install     Install dependencies
  clean       Remove build artifacts and node_modules
  lint        Run type checking (alias for check)
  reset       Clean + install + sync
  sync        Run svelte-kit sync
  help        Show this help message
EOF
}

cmd_dev() {
  echo "Starting dev server on http://$HOST:$PORT ..."
  npx vite dev --host "$HOST" --port "$PORT"
}

cmd_build() {
  echo "Building for production..."
  npx vite build
}

cmd_preview() {
  echo "Previewing production build on http://$HOST:$PORT ..."
  npx vite preview --host "$HOST" --port "$PORT"
}

cmd_test() {
  echo "Running tests..."
  npx vitest run
}

cmd_test_watch() {
  echo "Running tests in watch mode..."
  npx vitest
}

cmd_check() {
  echo "Running type checks..."
  npx svelte-kit sync && npx svelte-check --tsconfig ./tsconfig.json
}

cmd_install() {
  echo "Installing dependencies..."
  npm install
}

cmd_clean() {
  echo "Cleaning build artifacts..."
  rm -rf .svelte-kit build node_modules
  echo "Done."
}

cmd_sync() {
  echo "Syncing SvelteKit..."
  npx svelte-kit sync
}

cmd_reset() {
  cmd_clean
  cmd_install
  cmd_sync
  echo "Reset complete."
}

if [ $# -eq 0 ]; then
  usage
  exit 1
fi

case "$1" in
  dev)        cmd_dev ;;
  build)      cmd_build ;;
  preview)    cmd_preview ;;
  test)       cmd_test ;;
  test:watch) cmd_test_watch ;;
  check|lint) cmd_check ;;
  install)    cmd_install ;;
  clean)      cmd_clean ;;
  sync)       cmd_sync ;;
  reset)      cmd_reset ;;
  help|-h|--help) usage ;;
  *)
    echo "Unknown command: $1"
    usage
    exit 1
    ;;
esac
