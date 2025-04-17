#!/bin/bash
# Set permissions
chmod -R 755 /var/www/html/easybus-client

# Update nginx config if needed
if [ -f /etc/nginx/sites-available/easybus ]; then
    echo "Nginx configuration already exists"
else
    echo "Creating nginx configuration"
    cat > /etc/nginx/sites-available/easybus << 'EOL'
server {
    listen 80;
    server_name easybus-app.com www.easybus-app.com;

    root /var/www/html/easybus-client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL
    ln -s /etc/nginx/sites-available/easybus /etc/nginx/sites-enabled/
    systemctl restart nginx
fi
