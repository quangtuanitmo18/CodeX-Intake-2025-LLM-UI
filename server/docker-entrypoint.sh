#!/bin/sh
set -e

echo "Running database migrations..."

# Generate Prisma Client (if not already generated in build)
npx prisma generate

# For production: deploy migrations
# For development: push schema (can use migrate dev instead)
if [ "$NODE_ENV" = "production" ]; then
  echo "Deploying database migrations (production)..."
  npx prisma migrate deploy
else
  echo "Pushing database schema (development)..."
  npx prisma db push --skip-generate
fi

echo "Starting server..."
exec "$@"

