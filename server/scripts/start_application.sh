#!/bin/bash
# Navigate to application directory
cd /var/www/easybus-api

# Start the application using PM2 with the ecosystem config
pm2 start ecosystem.config.js --env production

# Ensure PM2 starts on system reboot
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
