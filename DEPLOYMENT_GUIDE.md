# MB-Medicos — Deployment Guide (100% Free)

Total cost = ₹0. Uses MongoDB Atlas + Render + Vercel, all free forever.

---

## Step 1 — Push Code to GitHub (Required for all deployments)

1. Go to https://github.com and create a free account
2. Click **New Repository** → name it `mb-medicos` → click **Create**
3. Open your terminal in VS Code and run:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mb-medicos.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Cloud Database (MongoDB Atlas) — FREE

1. Go to https://cloud.mongodb.com and create a free account
2. Click **Build a Database** → choose **M0 Free**
3. Pick any region → click **Create**
4. Create a database user:
   - Username: `mbmedicos`
   - Password: choose something strong, **save it**
5. Under **Network Access** → click **Add IP Address** → click **Allow Access From Anywhere** → Confirm
6. Go back to **Databases** → click **Connect** → **Drivers**
7. Copy the connection string, looks like:
   ```
   mongodb+srv://mbmedicos:PASSWORD@cluster0.xxxxx.mongodb.net/mb-medicos
   ```
   Replace `PASSWORD` with your actual password.

---

## Step 3 — Deploy Backend (Render) — FREE

1. Go to https://render.com and sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your `mb-medicos` GitHub repo
4. Fill in these settings:
   - **Name:** `mb-medicos-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add these one by one:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `JWT_SECRET` | `098ea0f6b065d749d00e20fc6ef37490db1f368cb8a59f45b69f9acf754aae3f1c20b411fb92c1752864f6d75d29269b3ee73da62b03002510471e8224acc945` |
   | `JWT_REFRESH_SECRET` | `fd0c7f2729eaa6258b654b9f7de56f063d916783aa1f884f12cabc9f7d31393ec3a6b95420868781ccb0c91b4e741562320cfbf9afc887438b069843371e2722` |
   | `NODE_ENV` | `production` |
   | `ADMIN_USERNAME` | `Ranjan1903` |
   | `CLIENT_URL` | `https://mb-medicos.vercel.app` *(update after Step 4)* |
   | `PORT` | `5000` |

6. Click **Create Web Service**
7. Wait 2–3 minutes for it to deploy
8. Render gives you a URL like: `https://mb-medicos-backend.onrender.com` — **save this**

> ⚠️ Free tier sleeps after 15 min of no use. First request takes ~30 sec to wake up. All requests after that are instant.

---

## Step 4 — Deploy Frontend (Vercel) — FREE

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New Project** → import your `mb-medicos` repo
3. Keep **Root Directory** as `/` (default)
4. Under **Environment Variables** add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://mb-medicos-backend.onrender.com` |

5. Click **Deploy**
6. Vercel gives you a URL like: `https://mb-medicos.vercel.app` — **save this**

---

## Step 5 — Update CORS

1. Go back to Render → your backend service → **Environment**
2. Update `CLIENT_URL` to your actual Vercel URL:
   ```
   CLIENT_URL=https://mb-medicos.vercel.app
   ```
3. Click **Save Changes** — Render redeploys automatically

---

## Step 6 — Update API URL in Code

In `vite.config.js`, update the proxy target:
```js
'/api': {
  target: 'https://mb-medicos-backend.onrender.com',
  changeOrigin: true,
},
'/socket.io': {
  target: 'https://mb-medicos-backend.onrender.com',
  ws: true,
},
```
Then push to GitHub — Vercel redeploys automatically.

---

## Step 7 — Seed the Production Database

1. Go to Render → your backend service → **Shell** tab
2. Run:
   ```bash
   node seed.js
   ```
   This creates the admin account and sample medicines in the cloud database.

---

## Admin Login
- **Username:** `Ranjan1903`
- **Password:** `Ranjan2002`

---

## Your Live URLs
| What | URL |
|------|-----|
| Website | https://mb-medicos.vercel.app |
| Backend API | https://mb-medicos-backend.onrender.com |
| Database | MongoDB Atlas dashboard |

---

## Summary of All Free Services

| Service | What it does | Free limit |
|---------|-------------|------------|
| GitHub | Stores your code | Free forever |
| MongoDB Atlas | Database | 512MB free forever |
| Render | Runs your backend | Free forever (sleeps when idle) |
| Vercel | Hosts your frontend | Free forever, always fast |

**Total monthly cost = ₹0**
