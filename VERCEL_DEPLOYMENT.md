# Deploy CodeXero Waitlist to Vercel

## Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- Supabase project set up
- Git repository with your code

## Step 1: Prepare Your Environment Variables

### Create `.env.local` file in your project root:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Replace with your actual values:
1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Copy your Project URL and anon public key

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and sign in**

3. **Click "New Project"**

4. **Import your Git repository**
   - Select your repository
   - Vercel will auto-detect it's a Vite/React project

5. **Configure your project:**
   - **Project Name**: `codexero-waitlist` (or your preferred name)
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add each variable:
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: `https://your-project-id.supabase.co`
     - **Environment**: Production, Preview, Development
   
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - **Environment**: Production, Preview, Development

7. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new
   - Set environment variables when prompted

## Step 3: Verify Deployment

1. **Check your deployment URL** (e.g., `https://your-project.vercel.app`)

2. **Test the waitlist form:**
   - Open the modal
   - Try submitting with invalid data (should show errors)
   - Submit with valid data (should work and show confetti)

3. **Check Supabase:**
   - Go to your Supabase dashboard
   - Check the `waitlist_subscriptions` table
   - Verify new subscriptions are being added

## Step 4: Custom Domain (Optional)

1. **In Vercel dashboard**, go to your project
2. **Click "Domains"**
3. **Add your custom domain** (e.g., `waitlist.codexero.com`)
4. **Follow DNS configuration instructions**

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Check your environment variables in Vercel
   - Ensure they're set for all environments (Production, Preview, Development)

2. **"Table doesn't exist" error:**
   - Run the SQL setup script in Supabase
   - Check the table name matches your code

3. **Build errors:**
   - Ensure all dependencies are in `package.json`
   - Check for syntax errors in your code

4. **Environment variables not working:**
   - Redeploy after adding environment variables
   - Check variable names match exactly (case-sensitive)

### Debug Steps:

1. **Check Vercel logs** in your project dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** with `.env.local` file
4. **Check browser console** for JavaScript errors

## Post-Deployment

1. **Monitor your Supabase usage** (free tier limits)
2. **Set up alerts** for database errors
3. **Test on different devices** and browsers
4. **Share your waitlist URL** with your community!

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)

Your CodeXero waitlist is now ready to capture subscribers worldwide! 🚀
