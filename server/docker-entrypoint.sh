#!/bin/sh
set -e

echo "Running database migrations..."

# Prisma Client should already be generated in build stage
# Skip generation if .prisma folder exists (it should from build)
# If not, this will fail but that's expected - means build stage failed
if [ ! -d "node_modules/.prisma" ]; then
  echo "WARNING: Prisma Client not found! This should have been generated in build stage."
  echo "Attempting to generate (may fail if dev deps missing)..."
  npx prisma generate --schema=./prisma/schema.prisma || echo "Generation failed, continuing anyway..."
fi

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

