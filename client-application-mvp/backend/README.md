# Backend API

Node.js + Express API for storing client application submissions in Railway MySQL.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill the MySQL credentials.
3. Create the database and run `database/schema.sql`.
4. Start the API:
   ```bash
   npm run dev
   ```

## Railway deployment

1. Create a Railway project.
2. Add a MySQL database service.
3. Add this `backend` folder as the Node service.
4. Set the service root directory to `backend` if deploying from the monorepo.
5. Add environment variables:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`
   - `USER_PANEL_URL`
   - `ADMIN_PANEL_URL`
6. Run `database/schema.sql` in the Railway MySQL console.
7. Railway will provide `PORT`; the app uses `process.env.PORT || 5000`.

## API routes

- `GET /api/health`
- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `DELETE /api/applications/:id`
