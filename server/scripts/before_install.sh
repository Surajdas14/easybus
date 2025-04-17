#!/bin/bash
# Install PM2 globally if not already installed
if ! [ -x "$(command -v pm2)" ]; then
  echo 'Installing PM2...' 
  npm install pm2 -g
fi

# Create directory if it doesn't exist
if [ ! -d /var/www/easybus-api ]; then
  mkdir -p /var/www/easybus-api
fi

# Clean the directory
rm -rf /var/www/easybus-api/*
