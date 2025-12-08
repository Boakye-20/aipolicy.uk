# UK AI Policy Tracker - Next.js Edition

A modern, interactive dashboard for tracking and analyzing UK AI policies and publications. Built with Next.js, TypeScript, and Recharts.

## 🚀 Features

- **Interactive Dashboard**: Real-time filtering and visualization of policy data
- **Department Analysis**: Compare AI policy activity across UK government departments
- **Priority Tracking**: Identify high-priority policies requiring action
- **Data Visualization**: Beautiful charts showing trends, distributions, and insights
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Fast Performance**: Server-side rendering with Next.js for optimal speed
- **Python Data Pipeline**: Automated data collection and AI analysis from GOV.UK
- **Quarterly Updates**: Keep your dashboard fresh with ~$0.05/quarter auto-updates

## 📋 Prerequisites

### For Dashboard (Required):
- Node.js 18+ installed

### For Data Updates (Optional):
- Python 3.8+ installed
- OpenAI API key (for AI analysis)
- See `python-scripts/README.md` for details

## 🛠️ Setup Instructions

### 1. Copy Your Existing Files

From your original project, copy these folders/files:

```bash
# Create the data directory
mkdir data

# Copy your CSV file
cp /path/to/old/project/uk_ai_policy_powerbi_ready.csv ./data/

# OPTIONAL: Copy your Python scripts if you want to keep them together
mkdir python-scripts
cp /path/to/old/project/*.py ./python-scripts/
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Recharts (charts library)
- Tailwind CSS (styling)
- TypeScript
- Papaparse (CSV parsing)
- Lucide React (icons)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
uk-ai-policy-nextjs/
├── app/
│   ├── api/
│   │   └── policies/
│   │       └── route.ts          # API endpoint for serving CSV data
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── Dashboard.tsx             # Main dashboard component
│   ├── StatCard.tsx              # Metric cards
│   ├── DepartmentChart.tsx       # Department bar chart
│   ├── PriorityChart.tsx         # Priority pie chart
│   └── PolicyTable.tsx           # Policy data table
├── lib/
│   └── utils.ts                  # Utility functions
├── types/
│   └── policy.ts                 # TypeScript types
├── data/
│   └── uk_ai_policy_powerbi_ready.csv  # Your data (YOU ADD THIS)
├── python-scripts/               # Optional: Your Python scripts
│   ├── 1_download_data.py
│   ├── complete_fresh_analysis_gpt4o.py
│   └── export_for_powerbi_updated.py
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### API Endpoint

The API reads from `/data/uk_ai_policy_powerbi_ready.csv` by default. If you want to change the file path, edit:

```typescript
// app/api/policies/route.ts
const csvPath = path.join(process.cwd(), 'data', 'YOUR_FILE_NAME.csv');
```

### Styling

The app uses Tailwind CSS. Customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { ... } // Change these values
    }
  }
}
```

## 🎨 Components Overview

### Dashboard
Main component that orchestrates everything. Handles:
- Data fetching from API
- Filtering by department and priority
- Loading and error states
- Layout of all sub-components

### StatCard
Displays key metrics with icons:
- Total policies
- Average relevance score
- High priority count
- Action required count

### DepartmentChart
Bar chart showing document count by department using Recharts.

### PriorityChart
Pie chart showing priority distribution (Critical, High, Medium, Low, Minimal).

### PolicyTable
Paginated table with:
- Title, department, priority
- Relevance score
- Published date
- Link to original document

## 🔄 Data Flow

1. **Python Scripts** → Collect and analyze data → Save to CSV
2. **Next.js API Route** → Read CSV → Parse and filter
3. **Dashboard Component** → Fetch from API → Display charts/tables
4. **User Interaction** → Filter/paginate → Re-fetch data

## 📊 Keeping Data Updated

### Option 1: Automated Quarterly Update (Recommended)

**Cost:** ~$0.05/quarter

```bash
cd python-scripts
./quarterly_update.sh
```

This script automatically:
1. Downloads latest data from GOV.UK
2. Analyzes new policies with AI
3. Exports to CSV
4. Updates your dashboard

### Option 2: Manual Update

```bash
cd python-scripts
python 1_download_data.py
python quarterly_update.py
python export_for_powerbi_updated.py
cp uk_ai_policy_powerbi_ready.csv ../data/
```

### Option 3: Full Refresh (One-time)

**Cost:** ~$3.50 | **Use when:** First setup or major data issues

```bash
cd python-scripts
python 1_download_data.py
python complete_fresh_analysis_IMPROVED.py
python export_for_powerbi_updated.py
cp uk_ai_policy_powerbi_ready.csv ../data/
```

📚 **See `PYTHON_SCRIPTS_GUIDE.md` for detailed instructions**

## 🚀 Deployment Options

### Vercel (Recommended - Easiest)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Next.js and deploy
5. **Important**: Upload your CSV file to `/data` after deployment

### Netlify
```bash
npm run build
# Upload the .next folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🔐 Environment Variables (Optional)

If you want to add API keys or configuration:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🐛 Troubleshooting

### "Data file not found" error
- Make sure `uk_ai_policy_powerbi_ready.csv` is in the `/data` folder
- Check the file name matches exactly (case-sensitive)

### Charts not displaying
- Check browser console for errors
- Ensure CSV has the correct column names
- Verify data types are correct (numbers as numbers, not strings)

### Build errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Next Steps

1. ✅ Basic dashboard working
2. 🔄 Add more chart types (timeline, heatmap)
3. 🔍 Add search functionality
4. 📥 Add export to Excel/PDF
5. 🔔 Add email alerts for high-priority policies
6. 📱 Build mobile app with React Native
7. 🤖 Add AI-powered insights with Claude API

## 👨‍💻 Authors

**Paul Kwarteng**

- LinkedIn: [Paul Kwarteng](https://www.linkedin.com/in/paul-kwarteng-22a71b196/)
- GitHub: [@Boakye-20](https://github.com/Boakye-20)


## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📄 License

MIT

## 💡 Tips for Success

1. **Keep Python scripts separate**: They work great as-is for data collection
2. **Update CSV regularly**: Set up a schedule to refresh your data
3. **Customize visualizations**: Modify chart components to show what matters to you
4. **Add authentication**: If deploying publicly, consider adding login
5. **Monitor performance**: Use Vercel Analytics to track usage

---

Built with ❤️ using Next.js, TypeScript, and Recharts
