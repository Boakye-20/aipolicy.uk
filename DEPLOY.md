# 🚀 Deploy to Vercel - Step by Step

Deploy your UK AI Policy Tracker to the web in 5 minutes, completely free!

## Why Vercel?

- ✅ **Free tier** - Perfect for personal projects
- ✅ **Automatic deployments** - Push to GitHub = auto deploy
- ✅ **Fast global CDN** - Your site loads fast everywhere
- ✅ **HTTPS included** - Secure by default
- ✅ **Zero configuration** - Just works with Next.js

## Prerequisites

- GitHub account (free)
- Vercel account (free)
- Your Next.js project

---

## Method 1: GitHub + Vercel (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - UK AI Policy Tracker"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/uk-ai-policy-tracker.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (use GitHub account)
3. Click **"New Project"**
4. Import your GitHub repository
5. Vercel auto-detects Next.js - click **"Deploy"**
6. Wait 2-3 minutes ☕
7. **Done!** Your site is live 🎉

Your URL will be: `https://your-project-name.vercel.app`

### Step 3: Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project
2. Settings → Domains
3. Add your domain (e.g., `ai-policy-tracker.com`)
4. Follow DNS instructions

---

## Method 2: Vercel CLI (For Quick Tests)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? uk-ai-policy-tracker
# - Directory? ./
# - Build settings? (default - just press enter)
# - Deploy? Yes

# Wait 2 minutes... Done!
```

---

## Important Notes

### 1. Data File Considerations

Your CSV file is included in the deployment. Options:

**Option A: Include CSV in deployment (Simple)**
- CSV is committed to Git
- Deploys with your code
- To update: Replace CSV, commit, push

**Option B: External data source (Advanced)**
- Store CSV in cloud storage (AWS S3, Google Cloud Storage)
- Fetch from external URL in API route
- Better for frequently updated data

For now, Option A is easiest!

### 2. Environment Variables

If you add API keys later:

In Vercel dashboard:
1. Project Settings → Environment Variables
2. Add your variables:
   - `ANTHROPIC_API_KEY` (if using Claude API)
   - `DATABASE_URL` (if adding database)

### 3. Automatic Deployments

Every time you push to GitHub:
- Vercel automatically rebuilds
- New version goes live in ~2 minutes
- Previous versions kept (easy rollback)

---

## Updating Your Deployed Site

### Update Code
```bash
git add .
git commit -m "Update: added new feature"
git push
# Vercel auto-deploys in 2 minutes!
```

### Update Data
```bash
# Run your Python scripts to get new data
python python-scripts/1_download_data.py
python python-scripts/complete_fresh_analysis_gpt4o.py
python python-scripts/export_for_powerbi_updated.py

# Copy new CSV
cp uk_ai_policy_powerbi_ready.csv data/

# Commit and push
git add data/uk_ai_policy_powerbi_ready.csv
git commit -m "Data update: November 2025"
git push
# Vercel auto-deploys with new data!
```

---

## Advanced: Automated Data Updates

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/update-data.yml`:

```yaml
name: Update Policy Data

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run data collection
        run: |
          python python-scripts/1_download_data.py
          python python-scripts/complete_fresh_analysis_gpt4o.py
          python python-scripts/export_for_powerbi_updated.py
      
      - name: Commit and push if changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/uk_ai_policy_powerbi_ready.csv
          git commit -m "Auto-update: Policy data $(date)" || exit 0
          git push
```

This automatically:
1. Runs your Python scripts quarterly
2. Updates the CSV
3. Commits and pushes
4. Triggers Vercel deployment

### Option 2: Vercel Cron Jobs (Coming Soon)

Vercel is adding support for scheduled functions. Stay tuned!

---

## Monitoring Your Site

### Vercel Analytics (Free)

In Vercel dashboard:
1. Enable Analytics
2. See:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Custom Domain + Analytics

For professional setup:
1. Buy domain ($10-15/year)
2. Connect to Vercel
3. Add Google Analytics
4. Monitor usage and performance

---

## Troubleshooting

### Build fails on Vercel

**Check build logs** in Vercel dashboard for errors.

Common fixes:
```bash
# Test build locally first
npm run build

# If it works locally but fails on Vercel:
# - Check Node.js version (must be 18+)
# - Check environment variables
# - Check CSV file is in git
```

### CSV file not found after deployment

Make sure CSV is committed:
```bash
git add data/uk_ai_policy_powerbi_ready.csv
git commit -m "Add data file"
git push
```

Check `.gitignore` doesn't exclude CSV:
```bash
# .gitignore should NOT have:
# *.csv
# /data/
```

### Site is slow

- Enable Vercel Analytics to see what's slow
- Consider optimizing CSV size
- Add loading states
- Use Vercel Edge Functions for faster response

---

## Cost

**Free tier includes:**
- Unlimited websites
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN
- 100 serverless function executions/day

**This is MORE than enough for a portfolio project!**

**Pro tier ($20/month) adds:**
- More bandwidth
- More function executions
- Team collaboration
- Advanced analytics

*For your use case, free tier is perfect!*

---

## Your Live Site Checklist

- [ ] Site loads correctly
- [ ] Dashboard displays all data
- [ ] Charts render properly
- [ ] Filters work
- [ ] Table pagination works
- [ ] Links open correctly
- [ ] Mobile view looks good
- [ ] Share URL with potential employers!

---

## Next Steps After Deployment

1. **Add to Portfolio**
   - GitHub: Pin the repository
   - LinkedIn: Share project URL
   - Resume: Add "Built Next.js dashboard deployed on Vercel"

2. **Share with Network**
   - Post on LinkedIn with screenshot
   - Add to personal website
   - Share in tech communities

3. **Iterate**
   - Monitor analytics
   - Add features based on usage
   - Keep data updated quarterly

---

**Your dashboard is now live on the internet! 🚀**

Share it with recruiters, add it to your portfolio, and show off your full-stack skills!

URL format: `https://uk-ai-policy-tracker.vercel.app` (or your custom domain)
