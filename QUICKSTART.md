# 🚀 Quick Start Guide

Get your UK AI Policy Tracker running in 5 minutes!

## Step 1: Copy Your Data

```bash
# Copy your CSV file to the data folder
cp /path/to/your/uk_ai_policy_powerbi_ready.csv ./data/
```

## Step 2: Run Setup

### Option A: Automated Setup (Mac/Linux)
```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup (Windows/Mac/Linux)
```bash
npm install
```

## Step 3: Start the App

```bash
npm run dev
```

## Step 4: Open in Browser

Go to: **http://localhost:3000**

That's it! 🎉

---

## What You'll See

1. **Dashboard Overview** - Key metrics at the top
2. **Department Chart** - Bar chart of policies by department
3. **Priority Chart** - Pie chart showing priority distribution  
4. **Policy Table** - Searchable/filterable table of all policies

## Filters

Use the dropdown menus to filter by:
- Department (DSIT, DBT, Cabinet Office, etc.)
- Priority (Critical, High, Medium, Low)

## Next Steps

- 📖 Read the full [README.md](README.md) for deployment options
- 🎨 Customize the dashboard components
- 📊 Add more visualizations
- 🚀 Deploy to Vercel for free hosting

---

## Troubleshooting

### "Data file not found" error
Make sure the CSV is in `/data/uk_ai_policy_powerbi_ready.csv` (exact filename!)

### Port already in use
```bash
npm run dev -- -p 3001
# Opens on http://localhost:3001 instead
```

### Installation issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Need help?** Check the full README.md for detailed documentation.
