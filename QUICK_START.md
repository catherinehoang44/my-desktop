# Quick Start Guide

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm run install-all
```

This will install all dependencies for the root, server, and client.

## Step 2: Set Up Environment File

Create a `.env` file in the `server` folder:

```bash
cd server
cp .env.example .env
```

Or manually create `server/.env` with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/retro-desktop
NODE_ENV=development
```

**Note:** If you don't have MongoDB installed, the app will still run but you'll see connection errors in the console. The frontend will still work!

## Step 3: Add Background Image (Optional)

Place your `retro-site-bg.png` file in:

```
client/public/retro-site-bg.png
```

## Step 4: Run the Application

You have two options:

### Option A: Run Both Together (if concurrently is available)

From the root directory:

```bash
npm run dev
```

### Option B: Run Separately (Recommended if you have conflicts)

**Terminal 1 - Start the Backend Server:**

```bash
cd server
npm run dev
```

This starts the backend on `http://localhost:5000`

**Terminal 2 - Start the Frontend:**

```bash
cd client
npm start
```

This starts the React app on `http://localhost:3000`

## Step 5: View in Browser

Open your browser and go to:

```
http://localhost:3000
```

The retro desktop should now be visible!

---

## Troubleshooting

**If you get "port already in use" errors:**

- Make sure no other applications are using ports 3000 or 5000
- Or change the ports in the configuration files

**If MongoDB connection fails:**

- The frontend will still work, but desktop item persistence won't work
- You can install MongoDB locally or use MongoDB Atlas (free cloud option)

**If dependencies fail to install:**

- Make sure you have Node.js installed (v14 or higher)
- Try deleting `node_modules` folders and running `npm run install-all` again
