# Client Application MVP

Full-stack MVP with three separately deployable apps:

- `backend`: Node.js + Express API for Railway
- `user-panel`: React + TypeScript + Vite frontend for Vercel
- `admin-panel`: React + TypeScript + Vite dashboard for Vercel

## 1. Run Backend Locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Create a MySQL database, then run `backend/database/schema.sql`.

Required backend environment variables:

- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `USER_PANEL_URL`
- `ADMIN_PANEL_URL`

## 2. Run User Panel Locally

```bash
cd user-panel
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:5000`.

## 3. Run Admin Panel Locally

```bash
cd admin-panel
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:5000`.

## 4. Deploy Backend On Railway

1. Create a Railway project.
2. Add a Railway MySQL database.
3. Deploy the `backend` folder as a Node.js service.
4. Set the root directory to `backend` if Railway is connected to this whole repository.
5. Add the backend environment variables listed above.
6. Run `backend/database/schema.sql` against the Railway MySQL database.
7. Use the generated Railway backend URL as the frontend `VITE_API_URL`.

## 5. Deploy Frontends On Vercel

Deploy `user-panel` and `admin-panel` as two separate Vercel projects.

For each Vercel project:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-railway-api-url`

After deployment, add both Vercel URLs to the Railway backend:

- `USER_PANEL_URL=https://your-user-panel.vercel.app`
- `ADMIN_PANEL_URL=https://your-admin-panel.vercel.app`

## 6. Environment Files

Each project includes its own `.env.example`.

Do not put database secrets in either frontend. The frontends only need `VITE_API_URL`.

## API Summary

- `GET /api/health`
- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `DELETE /api/applications/:id`
