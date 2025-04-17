#!/bin/bash
# Create directory if it doesn't exist
if [ ! -d /var/www/html/easybus-client ]; then
  mkdir -p /var/www/html/easybus-client
fi

# Clean the directory
rm -rf /var/www/html/easybus-client/*
