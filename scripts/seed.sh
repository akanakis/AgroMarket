#!/usr/bin/env bash
# Seed the database with test data.
# Usage:  ./scripts/seed.sh
#         ./scripts/seed.sh --env-file .env.docker
set -e

ENV_FILE=".env.docker"
if [ "$1" == "--env-file" ] && [ -n "$2" ]; then
  ENV_FILE="$2"
fi

echo "Seeding database (env: $ENV_FILE)..."
docker-compose --env-file "$ENV_FILE" exec backend python seed.py
echo ""
echo "Test accounts:"
echo "  Buyer    — buyer@test.com    / Test1234!"
echo "  Producer — producer@test.com / Test1234!"
echo "  Admin    — admin@test.com    / Admin1234!"
