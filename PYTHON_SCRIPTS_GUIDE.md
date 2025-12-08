# 🐍 Python Scripts Integration Guide

This guide explains how to use the Python data collection and analysis scripts with your Next.js dashboard.

---

## 📁 What's in python-scripts/

```
python-scripts/
├── 1_download_data.py                    # Collect data from GOV.UK API
├── complete_fresh_analysis_IMPROVED.py   # Full AI analysis (one-time)
├── quarterly_update.py                   # Incremental updates (quarterly)
├── export_for_powerbi_updated.py         # Export to CSV
├── filter_ai_policies.py                 # Filter AI-relevant policies
├── .venv/                                # Python virtual environment
└── *.txt                                 # Log files
```

---

## 🚀 Quick Start

### 1. Set Up Python Environment

```bash
cd python-scripts

# Create virtual environment (if not already present)
python3 -m venv .venv

# Activate it
source .venv/bin/activate  # On macOS/Linux
# .venv\Scripts\activate   # On Windows

# Install dependencies
pip install requests pandas openai tqdm python-dotenv
```

### 2. Set Your OpenAI API Key

```bash
# Create .env file in python-scripts folder
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Or export it
export OPENAI_API_KEY='sk-your-key-here'
```

---

## 📊 Data Pipeline Workflow

### Option A: Full Refresh (First Time or Major Update)

**Cost:** ~$3.50 | **Time:** ~35 minutes

```bash
cd python-scripts

# Step 1: Download raw data from GOV.UK (FREE)
python 1_download_data.py

# Step 2: Analyze with AI (COSTS ~$3.50)
python complete_fresh_analysis_IMPROVED.py

# Step 3: Export for dashboard (FREE)
python export_for_powerbi_updated.py

# Step 4: Copy to Next.js data folder
cp uk_ai_policy_powerbi_ready.csv ../data/
```

### Option B: Quarterly Update (Recommended)

**Cost:** ~$0.05 | **Time:** ~2 minutes

```bash
cd python-scripts

# Step 1: Download latest data (FREE)
python 1_download_data.py

# Step 2: Analyze only NEW policies (COSTS ~$0.05)
python quarterly_update.py

# Step 3: Export for dashboard (FREE)
python export_for_powerbi_updated.py

# Step 4: Copy to Next.js data folder
cp uk_ai_policy_powerbi_ready.csv ../data/
```

---

## 📝 Script Details

### 1_download_data.py

**Purpose:** Fetch AI-related publications from GOV.UK API

**Departments Covered:**
- DSIT (Department for Science, Innovation & Technology)
- DBT (Department for Business and Trade)
- Cabinet Office
- Home Office
- ICO (Information Commissioner's Office)
- CMA (Competition and Markets Authority)
- Treasury
- DHSC (Health and Social Care)
- DfE (Education)

**Output:** `data/uk_ai_policy_raw.csv`

**Cost:** FREE

### complete_fresh_analysis_IMPROVED.py

**Purpose:** Full AI-powered analysis of ALL policies

**Features:**
- GPT-4o-mini analysis
- Improved scoring system (news ≠ regulations)
- Categorizes by type, sector, impact
- Extracts key topics
- Calculates priority scores

**Cost:** ~$3.50 (one-time)

**When to use:** 
- First time setup
- Major data quality issues
- Complete re-analysis needed

### quarterly_update.py

**Purpose:** Analyze ONLY new policies since last run

**Features:**
- Same analysis as improved script
- Only processes new/changed policies
- 95% cost savings vs full analysis
- Preserves existing analyzed data

**Cost:** ~$0.05 per quarter

**When to use:**
- Quarterly updates
- Regular maintenance
- New policies only

### export_for_powerbi_updated.py

**Purpose:** Transform analyzed data for dashboard

**Output:** 
- `uk_ai_policy_powerbi_ready.csv` (for Next.js)
- `uk_ai_policy_filtered.csv` (AI-only policies)

**Cost:** FREE

### filter_ai_policies.py

**Purpose:** Remove non-AI policies from dataset

**Cost:** FREE

---

## 💰 Cost Breakdown

### Year 1:
```
Initial analysis:        $3.50 (one-time)
Quarterly updates (4×):  $0.20 (4 × $0.05)
─────────────────────────────────
Total:                   $6.10
```

### Year 2+:
```
Quarterly updates only:  $0.20/year
```

**Less than the price of a coffee per month!** ☕

---

## 🔄 Recommended Update Schedule

### Quarterly (Every 3 months)

```bash
#!/bin/bash
# save as: python-scripts/quarterly_update.sh

cd python-scripts
source .venv/bin/activate

echo "🔍 Downloading latest data..."
python 1_download_data.py

echo "🤖 Analyzing new policies..."
python quarterly_update.py

echo "📊 Exporting for dashboard..."
python export_for_powerbi_updated.py

echo "📁 Updating dashboard data..."
cp uk_ai_policy_powerbi_ready.csv ../data/

echo "✅ Update complete!"
deactivate
```

Make it executable:
```bash
chmod +x python-scripts/quarterly_update.sh
```

Run it:
```bash
./python-scripts/quarterly_update.sh
```

---

## 🔧 Troubleshooting

### "Module not found" error

```bash
cd python-scripts
source .venv/bin/activate
pip install requests pandas openai tqdm python-dotenv
```

### "API key not found" error

```bash
# Make sure .env file exists
echo "OPENAI_API_KEY=sk-your-key-here" > python-scripts/.env

# Or export it
export OPENAI_API_KEY='sk-your-key-here'
```

### "Data file not found" error

```bash
# Make sure you ran download first
cd python-scripts
python 1_download_data.py
```

### Scripts run but dashboard shows old data

```bash
# Make sure you copied the CSV
cp python-scripts/uk_ai_policy_powerbi_ready.csv data/

# Restart Next.js dev server
npm run dev
```

---

## 📈 Data Quality Checks

After running scripts, check the logs:

```bash
# View last analysis log
cat python-scripts/improved_analysis_log.txt

# View last weekly update log
cat python-scripts/quarterly_update_log.txt

# View PowerBI prep report
cat python-scripts/powerbi_prep_report.txt
```

Look for:
- ✅ Success rates (should be >95%)
- 📊 Policy counts (should match expectations)
- 💰 Cost estimates (should be as expected)
- ⚠️ Any errors or warnings

---

## 🔐 Security Best Practices

1. **Never commit your API key**
   ```bash
   # .gitignore already includes .env files
   # Still, double-check:
   grep -r "sk-" . --exclude-dir=.git
   ```

2. **Use environment variables**
   ```bash
   # Good
   export OPENAI_API_KEY='sk-...'
   
   # Bad - hardcoded in script
   api_key = "sk-..."
   ```

3. **Monitor API usage**
   - Check OpenAI dashboard regularly
   - Set spending limits
   - Scripts show estimated costs

---

## 🎯 Integration with Next.js Dashboard

The Python scripts generate `uk_ai_policy_powerbi_ready.csv` which is automatically read by your Next.js app:

```typescript
// lib/data.ts reads from this file
const csvPath = path.join(process.cwd(), 'data', 'uk_ai_policy_filtered.csv');
```

**After updating data:**
1. Run Python scripts
2. Copy CSV to `data/` folder
3. Restart Next.js (or it auto-reloads)
4. Dashboard shows new data immediately

---

## 📚 Related Documentation

- **COMPLETE_SETUP_SUMMARY.md** - Overview of entire system
- **INSTALLATION_GUIDE.md** - Dashboard setup
- **QUARTERLY_UPDATE_GUIDE.md** - Detailed quarterly update process
- **README.md** - Next.js dashboard guide

---

## 💡 Pro Tips

1. **Run quarterly updates on same day/time** - Consistency helps tracking
2. **Check logs after each run** - Catch issues early
3. **Backup your data** - Copy CSVs before major updates
4. **Test locally first** - Make sure updates work before deploying
5. **Automate with cron** - Set it and forget it

### Example Cron Job (Runs every Monday at 9am)

```bash
# Edit crontab
crontab -e

# Add this line:
0 9 1 */3 * cd /path/to/aipolicy.next/python-scripts && ./quarterly_update.sh >> quarterly_cron.log 2>&1
```

---

## 🆘 Need Help?

1. Check the log files in `python-scripts/`
2. Review error messages carefully
3. Ensure all dependencies are installed
4. Verify API key is set correctly
5. Check that data folder exists

---

## ✅ Quick Checklist

Before running scripts:
- [ ] Python 3.8+ installed
- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] OpenAI API key set
- [ ] data/ folder exists

After running scripts:
- [ ] Check log files for errors
- [ ] Verify CSV file generated
- [ ] Copy CSV to Next.js data folder
- [ ] Restart Next.js dashboard
- [ ] Verify new data appears

---

**You're all set! Your Python scripts and Next.js dashboard are now fully integrated.** 🎉
