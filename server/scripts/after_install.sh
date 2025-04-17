#!/bin/bash
# Navigate to the application directory
cd /var/www/easybus-api

# Install dependencies
npm install --production

# Copy environment file
cp .env.production .env

# Set permissions
chmod -R 755 /var/www/easybus-api
