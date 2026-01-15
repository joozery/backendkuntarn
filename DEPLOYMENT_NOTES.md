## Backend Deployment Notes

Environment (.env):

```
PORT=1997
CORS_ORIGIN=https://kuntran.site
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=installment_db
JWT_SECRET=your_strong_secret
```

Initialize database:

```
npm ci --no-audit --no-fund
node scripts/setup_database.js
node scripts/setup_admin_users.js
```

Run:

```
npm run start
```

Nginx (API) example:

```
server {
    server_name api.kuntran.site;
    listen 443 ssl http2;

    # ssl_certificate ...;
    # ssl_certificate_key ...;

    location / {
        proxy_pass http://127.0.0.1:1997;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS passthrough (backend also sends proper CORS)
        add_header 'Access-Control-Allow-Origin' 'https://kuntran.site' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;

        if ($request_method = OPTIONS) {
          return 200;
        }
    }
}
```

Nginx (Frontend) example:

```
server {
    server_name kuntran.site;
    listen 443 ssl http2;

    # ssl_certificate ...;
    # ssl_certificate_key ...;

    root /var/www/kuntran.site/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~* \.(png|jpg|jpeg|gif|svg|css|js|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }
}
```


