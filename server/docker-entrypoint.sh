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
  
  # Check if migrations directory exists and has migrations
  if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "No migrations found. Initializing database with db push..."
    # Ensure database directory exists and is writable
    mkdir -p /app/prisma
    
    # Check permissions
    echo "Checking database directory permissions..."
    ls -la /app/prisma || echo "Cannot list /app/prisma directory"
    
    # Extract database path from DATABASE_URL
    DB_PATH=$(echo "$DATABASE_URL" | sed 's|file:||' | sed 's|^\./|/app/|')
    echo "Database path: $DB_PATH"
    
    # If database file exists, check if we can write to it
    if [ -f "$DB_PATH" ]; then
      echo "Database file exists at $DB_PATH"
      # Check if we can write to the directory
      if [ ! -w "$(dirname "$DB_PATH")" ]; then
        echo "WARNING: Cannot write to database directory. This may cause issues."
      fi
    else
      echo "Database file does not exist yet. It will be created."
    fi
    
    # Try to use local prisma CLI, fallback to npx
    PRISMA_CMD=""
    if [ -f "./node_modules/.bin/prisma" ]; then
      PRISMA_CMD="./node_modules/.bin/prisma"
      echo "Using local Prisma CLI: $PRISMA_CMD"
      # Test if prisma CLI works
      $PRISMA_CMD --version || echo "WARNING: Prisma CLI test failed"
    else
      PRISMA_CMD="npx prisma"
      echo "Using npx to run Prisma (may download if not cached)"
    fi
    
    # Run db push with verbose output
    echo "Running: $PRISMA_CMD db push --skip-generate --accept-data-loss"
    if $PRISMA_CMD db push --skip-generate --accept-data-loss 2>&1; then
      echo "Database initialized successfully. Consider creating migrations for future deployments."
    else
      EXIT_CODE=$?
      echo "ERROR: Failed to initialize database with db push (exit code: $EXIT_CODE)"
      echo "This might be due to:"
      echo "  - Network issues (if using npx)"
      echo "  - Permissions issues (check if /app/prisma is writable)"
      echo "  - Database file already exists with incompatible schema"
      echo "  - Prisma CLI not working correctly"
      
      # Try to get more info
      echo "Attempting to get more information..."
      ls -la /app/prisma/ || echo "Cannot list prisma directory"
      whoami || echo "Cannot get current user"
      
      exit 1
    fi
  else
    echo "Migrations found. Deploying..."
    # Try to use local prisma CLI, fallback to npx
    if [ -f "./node_modules/.bin/prisma" ]; then
      ./node_modules/.bin/prisma migrate deploy
    else
      npx prisma migrate deploy
    fi
  fi
else
  echo "Pushing database schema (development)..."
  npx prisma db push --skip-generate
fi

echo "Starting server..."

# If running as root, try to switch to appuser before starting server
# But only if appuser exists (production has it, dev might not)
if [ "$(id -u)" = "0" ]; then
  # Check if appuser exists
  if id appuser >/dev/null 2>&1; then
    echo "Switching to appuser to run server..."
    # Fix permissions on prisma directory
    chown -R appuser:appuser /app/prisma 2>/dev/null || true
    # Switch to appuser and run server using su
    exec su appuser -c "cd /app && exec $*"
  else
    echo "Running as root (appuser not found - this is OK for development)"
    exec "$@"
  fi
else
  exec "$@"
fi

