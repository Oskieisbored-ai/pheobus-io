#!/usr/bin/env bash
set -o errexit

echo "=== Installing backend dependencies ==="
cd backend
pip install -r requirements.txt

echo "=== Installing frontend dependencies ==="
cd ../frontend
npm install

echo "=== Building frontend ==="
npm run build

echo "=== Copying frontend build to backend/static ==="
cd ..
rm -rf backend/static
cp -r frontend/dist backend/static

echo "=== Seeding database ==="
cd backend
python seed_data.py || echo "Seed skipped (already seeded or error)"

echo "=== Build complete ==="
