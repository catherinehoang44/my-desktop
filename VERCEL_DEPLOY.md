# Deploying to Vercel

This guide will help you deploy your retro-desktop application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. MongoDB Atlas account (optional, for database features)
3. GitHub repository (already set up)

## Step 1: Install Vercel CLI (Optional)

You can deploy via the Vercel website (recommended) or using the CLI.

### Option A: Use npx (No Installation Required - Recommended)

You don't need to install Vercel globally. Just use `npx`:

```bash
npx vercel
```

This will download and run Vercel CLI without needing global installation permissions.

### Option B: Install Globally (If you prefer)

If you want to install globally and get permission errors, you have two options:

**Option 1: Fix npm permissions (Recommended)**

```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# Add to your shell profile (~/.zshrc or ~/.bash_profile)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Now install Vercel
npm install -g vercel
```

**Option 2: Use sudo (Not recommended, but works)**

```bash
sudo npm i -g vercel
```

## Step 2: Deploy via Vercel Dashboard

### Option A: Deploy from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `catherinehoang44/my-desktop`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of the repo)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd server && npm install && cd ../client && npm install`

### Option B: Deploy via CLI

```bash
cd /Users/catherinehoang/Downloads/retro-desktop

# Use npx (no installation needed)
npx vercel

# Or if you installed globally:
# vercel
```

Follow the prompts to link your project.

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Required (if using database):

- `MONGODB_URI` - Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/retro-desktop?retryWrites=true&w=majority`

### Optional (for email functionality):

- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` or `EMAIL_APP_PASSWORD` - Gmail app password

### How to add environment variables:

1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add each variable with the appropriate value
4. Select the environments (Production, Preview, Development)
5. Click "Save"

## Step 4: Deploy

If deploying via CLI:

```bash
# Using npx (no installation needed)
npx vercel --prod

# Or if you installed globally:
# vercel --prod
```

If deploying via dashboard, click "Deploy" after configuring.

## Step 5: Verify Deployment

After deployment:

1. Visit your Vercel URL (e.g., `your-project.vercel.app`)
2. Test the application features
3. Check the function logs in Vercel dashboard if there are any issues

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are listed in `package.json` files
3. Verify the build command is correct

### API Routes Not Working

- Ensure the `api/index.js` file exists and properly exports the Express app
- Check that routes are prefixed with `/api/`
- Verify environment variables are set correctly

### MongoDB Connection Issues

- Verify your `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
- Ensure the database user has proper permissions

### Static Files Not Loading

- Verify `outputDirectory` is set to `client/build`
- Check that the React build completed successfully
- Ensure public assets are in `client/public/`

## Project Structure for Vercel

```
retro-desktop/
├── api/
│   └── index.js          # Vercel serverless function entry
├── client/                # React frontend
│   ├── build/            # Built React app (generated)
│   ├── public/
│   └── src/
├── server/               # Express backend
│   ├── routes/
│   └── index.js         # Express app (exported for Vercel)
├── vercel.json           # Vercel configuration
└── package.json
```

## Notes

- Vercel automatically handles serverless functions for `/api/*` routes
- The Express app is wrapped in `api/index.js` for Vercel compatibility
- Static files are served from `client/build`
- All API routes are accessible at `/api/*`

## Updating Your Deployment

After making changes:

1. Commit and push to GitHub
2. Vercel will automatically redeploy (if connected to GitHub)
3. Or run `npx vercel --prod` if using CLI (or `vercel --prod` if installed globally)
