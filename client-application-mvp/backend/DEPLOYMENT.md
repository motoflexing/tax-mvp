# Railway Deployment

## Root Directory

```text
client-application-mvp/backend
```

## Build Command

```bash
npm install
```

## Start Command

```bash
npm start
```

## Railway Variables

Add these variables to the Railway backend service:

```text
DB_HOST=your_railway_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=your_mysql_port
USER_PANEL_URL=https://your-user-panel.vercel.app
ADMIN_PANEL_URL=https://your-admin-panel.vercel.app
```

Railway provides `PORT` automatically. For local development, `.env.example` includes:

```text
PORT=5000
```

## Railway Healthcheck

Use:

```text
/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "tax-mvp-api"
}
```

The healthcheck does not connect to MySQL. It returns HTTP 200 as long as the Express process is running, even before MySQL is configured.

## Database Notes

Run `database/schema.sql` against the Railway MySQL database before using the application form routes.

If MySQL credentials are missing or incorrect, database-backed routes may return JSON errors, but the Express server will continue running and `/api/health` will remain healthy.
