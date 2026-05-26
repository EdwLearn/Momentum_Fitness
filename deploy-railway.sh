#!/bin/bash
# Deploy Momentum Fitness frontend to Railway
# Railway CLI v4.6.1 compatible

set -e

echo "=============================="
echo "Deploy Momentum → Railway"
echo "=============================="

# Verify CLI auth
railway whoami || { echo "ERROR: Not logged in. Run: railway login"; exit 1; }

# Show linked service
echo ""
railway status

# Run build locally first to catch errors before upload
echo ""
echo "Verifying build..."
npm run build --silent && echo "Build OK" || { echo "Build FAILED — aborting deploy"; exit 1; }

# Deploy with explicit flags
# --no-gitignore: use .railwayignore instead of .gitignore
# --ci: stream build logs then exit cleanly
echo ""
echo "Deploying to Railway..."
railway up --no-gitignore --ci

echo ""
echo "Deploy done."
echo "Frontend: https://momentum-fitness.up.railway.app"
echo ""
echo "Build logs:  railway logs --build"
echo "Deploy logs: railway logs --deployment"
