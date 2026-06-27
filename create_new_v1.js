const fs = require('fs');
const path = require('path');

function parseDate(dateStr) {
    if (!dateStr) return new Date('2026-01-01');

    try {
        // Handle ISO format with Z
        if (dateStr.includes('T')) {
            return new Date(dateStr);
        }
        // Handle other formats
        return new Date(dateStr);
    } catch (e) {
        return new Date('2026-01-01');
    }
}

function categorizePolicy(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('urgent') || titleLower.includes('critical') ||
        titleLower.includes('emergency') || titleLower.includes('safety') ||
        titleLower.includes('security')) {
        return '1-Critical';
    } else if (titleLower.includes('action plan') || titleLower.includes('strategy') ||
        titleLower.includes('framework') || titleLower.includes('policy')) {
        return '2-High';
    } else if (titleLower.includes('report') || titleLower.includes('analysis') ||
        titleLower.includes('assessment') || titleLower.includes('review')) {
        return '3-Medium';
    } else {
        return '4-Low';
    }
}

function determinePolicyType(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('research') || titleLower.includes('analysis') ||
        titleLower.includes('assessment')) {
        return 'Research & Analysis';
    } else if (titleLower.includes('guidance') || titleLower.includes('guide')) {
        return 'Implementation Guidance';
    } else if (titleLower.includes('funding') || titleLower.includes('investment') ||
        titleLower.includes('grant')) {
        return 'Funding & Investment';
    } else if (titleLower.includes('regulation') || titleLower.includes('compliance')) {
        return 'Regulation & Compliance';
    } else if (titleLower.includes('international') || titleLower.includes('partnership')) {
        return 'International Cooperation';
    } else {
        return 'Research & Analysis';
    }
}

function determineSector(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('financial') || titleLower.includes('city') ||
        titleLower.includes('treasury')) {
        return 'Financial Services';
    } else if (titleLower.includes('education') || titleLower.includes('skills') ||
        titleLower.includes('workforce')) {
        return 'Education';
    } else if (titleLower.includes('health') || titleLower.includes('nhs')) {
        return 'Healthcare';
    } else if (titleLower.includes('digital') || titleLower.includes('tech')) {
        return 'Technology';
    } else {
        return 'Cross-Sector';
    }
}

function determineAIApplication(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('safety') || titleLower.includes('security')) {
        return 'Safety & Security';
    } else if (titleLower.includes('skills') || titleLower.includes('workforce') ||
        titleLower.includes('education')) {
        return 'Workforce & Skills';
    } else if (titleLower.includes('innovation') || titleLower.includes('rd') ||
        titleLower.includes('research')) {
        return 'Innovation & R&D';
    } else if (titleLower.includes('labour') || titleLower.includes('employment')) {
        return 'Algorithmic Decision-Making';
    } else {
        return 'Innovation & R&D';
    }
}

function determineBusinessImpact(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('critical') || titleLower.includes('major') ||
        titleLower.includes('significant')) {
        return 'High Impact';
    } else if (titleLower.includes('strategic') || titleLower.includes('important')) {
        return 'Strategic';
    } else {
        return 'Strategic';
    }
}

function determineStage(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('proposed') || titleLower.includes('plan')) {
        return 'Proposed';
    } else if (titleLower.includes('review') || titleLower.includes('assessment')) {
        return 'Under Review';
    } else {
        return 'Active';
    }
}

function determineAudience(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('public') || titleLower.includes('general')) {
        return 'General Public';
    } else if (titleLower.includes('business') || titleLower.includes('private')) {
        return 'Business/Private Sector';
    } else if (titleLower.includes('government') || titleLower.includes('sector')) {
        return 'Government/Public Sector';
    } else {
        return 'General Public';
    }
}

function generateAISummary(title, description) {
    const titleStr = title;
    const descStr = description;

    let summary = descStr;
    if (descStr.length > 150) {
        summary = descStr.substring(0, 150) + "...";
    }

    return `This document addresses ${titleStr.toLowerCase()} ${summary.toLowerCase()}.`;
}

function determinePrimaryTopic(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('safety') || titleLower.includes('security')) {
        return 'AI safety';
    } else if (titleLower.includes('skills') || titleLower.includes('workforce')) {
        return 'skills';
    } else if (titleLower.includes('innovation') || titleLower.includes('research')) {
        return 'innovation';
    } else if (titleLower.includes('funding') || titleLower.includes('investment')) {
        return 'funding';
    } else if (titleLower.includes('regulation') || titleLower.includes('compliance')) {
        return 'regulation';
    } else if (titleLower.includes('governance')) {
        return 'AI governance';
    } else {
        return 'innovation';
    }
}

function generateKeyTopics(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    const topics = [];

    const topicKeywords = {
        'AI safety': ['safety', 'security', 'risk'],
        'innovation': ['innovation', 'research', 'development'],
        'skills': ['skills', 'workforce', 'education', 'training'],
        'funding': ['funding', 'investment', 'grant'],
        'regulation': ['regulation', 'compliance', 'policy'],
        'governance': ['governance', 'ethics', 'framework'],
        'AI adoption': ['adoption', 'implementation', 'deployment'],
        'AI development': ['development', 'creation', 'building']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword))) {
            topics.push(topic);
        }
    }

    if (topics.length === 0) {
        topics.push('innovation');
    }

    return topics.slice(0, 3).join(', ');
}

function calculateRecency(publishedDate) {
    const today = new Date();
    const daysDiff = Math.floor((today - publishedDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 7) return 'This week';
    if (daysDiff <= 30) return 'Last month';
    if (daysDiff <= 90) return 'Last 3 months';
    if (daysDiff <= 365) return 'Last year';
    return 'Over 2 years ago';
}

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        const values = [];
        let currentValue = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }

    return data;
}

function writeCSV(filePath, data, headers) {
    const lines = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Quote values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        lines.push(values.join(','));
    }

    fs.writeFileSync(filePath, lines.join('\n'));
}

function createNewV1() {
    // Load current filtered data
    const currentData = parseCSV('data/uk_ai_policy_filtered.csv');

    // Load new 2026 data
    const newData = parseCSV('data/new_ai_documents_filtered_2026-01-30.csv');

    // Create a map of existing documents by URL for fast lookup
    const existingByUrl = new Map();
    currentData.forEach(row => {
        existingByUrl.set(row.url, row);
    });

    // Process new data to match current structure
    const processedNewRows = [];
    const trulyNewRows = [];

    for (const row of newData) {
        const publishedDate = parseDate(row.published_date);

        // Calculate date-related fields
        const year = publishedDate.getFullYear();
        const month = publishedDate.getMonth() + 1;
        const monthName = publishedDate.toLocaleString('default', { month: 'long' });
        const quarter = Math.ceil(month / 3);
        const quarterLabel = `Q${quarter}.0 ${year}.0`;
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        const daysSincePublished = Math.floor((new Date() - publishedDate) / (1000 * 60 * 60 * 24));
        const weekOfYear = getWeekNumber(publishedDate);

        // Generate AI-related fields
        const title = row.title;
        const description = row.description;

        const priorityCategory = categorizePolicy(title, description);
        const policyType = determinePolicyType(title, description);
        const businessImpact = determineBusinessImpact(title, description);
        const sectorFocus = determineSector(title, description);
        const aiApplication = determineAIApplication(title, description);
        const stage = determineStage(title, description);
        const audience = determineAudience(title, description);
        const aiSummary = generateAISummary(title, description);
        const primaryTopic = determinePrimaryTopic(title, description);
        const keyTopics = generateKeyTopics(title, description);
        const recency = calculateRecency(publishedDate);
        const summaryWordCount = description.split(' ').length;
        const topicsCount = keyTopics.split(', ').length;

        // Create row matching current structure
        const processedRow = {
            dept: row.dept || 'DSIT',
            dept_group: 'Innovation & Business',
            title: title,
            published_date: publishedDate.toISOString().replace('T', ' ').substring(0, 19),
            year: year,
            month: month,
            month_name: monthName,
            quarter: quarter,
            quarter_label: quarterLabel,
            year_month: yearMonth,
            priority_category: priorityCategory,
            policy_type: policyType,
            business_impact: businessImpact,
            sector_focus: sectorFocus,
            ai_application: aiApplication,
            stage: stage,
            audience: audience,
            ai_summary: aiSummary,
            primary_topic: primaryTopic,
            key_topics: keyTopics,
            recency: recency,
            days_since_published: daysSincePublished,
            summary_word_count: summaryWordCount,
            topics_count: topicsCount,
            description: description,
            url: row.url,
            format: row.format || 'research',
            display_type: row.display_type || 'Research',
            collection_date: new Date().toISOString().split('T')[0],
            week_of_year: weekOfYear
        };

        processedNewRows.push(processedRow);

        // Check if this is truly new (not in current data)
        if (!existingByUrl.has(row.url)) {
            trulyNewRows.push(processedRow);
        }
    }

    // Combine datasets
    const combinedData = [...currentData, ...trulyNewRows];

    // Sort by published date (newest first)
    combinedData.sort((a, b) => {
        const dateA = new Date(a.published_date);
        const dateB = new Date(b.published_date);
        return dateB - dateA;
    });

    // Save as new v1
    const headers = Object.keys(combinedData[0]);
    writeCSV('data/uk_ai_policy_filtered_v1.csv', combinedData, headers);

    console.log(`Successfully created new v1 dataset!`);
    console.log(`Current filtered records: ${currentData.length}`);
    console.log(`New 2026 records processed: ${processedNewRows.length}`);
    console.log(`Truly new records added: ${trulyNewRows.length}`);
    console.log(`New v1 total records: ${combinedData.length}`);
    console.log(`Saved to: data/uk_ai_policy_filtered_v1.csv`);

    // Show some of the truly new records
    if (trulyNewRows.length > 0) {
        console.log(`\nFirst few truly new records:`);
        trulyNewRows.slice(0, 5).forEach(row => {
            console.log(`${row.published_date} - ${row.title}`);
        });
    } else {
        console.log(`\nNo truly new records found - all were already in current dataset`);
    }

    return combinedData;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Run the merge
createNewV1();
