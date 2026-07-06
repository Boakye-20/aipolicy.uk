import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Policy } from '@/types/policy';

interface NewAIDocument {
    published_date: string;
    dept: string;
    title: string;
    description: string;
    url: string;
    link: string;
    format: string;
    display_type: string;
    organisations_raw: string;
}

// Function to categorize documents based on title, description, and format
function categorizePolicyType(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();
    const format = doc.format.toLowerCase();

    // Research & Analysis
    if (format.includes('research') ||
        title.includes('assessment') ||
        title.includes('analysis') ||
        title.includes('survey') ||
        title.includes('study') ||
        description.includes('research') ||
        description.includes('analysis') ||
        description.includes('assessment')) {
        return 'Research & Analysis';
    }

    // Implementation Guidance
    if (format.includes('guidance') ||
        title.includes('guide') ||
        title.includes('guidance') ||
        title.includes('standards') ||
        description.includes('guidance') ||
        description.includes('standards') ||
        description.includes('best practices')) {
        return 'Implementation Guidance';
    }

    // Strategy & Frameworks
    if (format.includes('policy_paper') ||
        format.includes('notice') ||
        title.includes('strategy') ||
        title.includes('plan') ||
        title.includes('framework') ||
        title.includes('statement') ||
        description.includes('strategy') ||
        description.includes('plan') ||
        description.includes('framework')) {
        return 'Strategy & Frameworks';
    }

    // Regulation & Compliance
    if (format.includes('correspondence') ||
        title.includes('regulation') ||
        title.includes('compliance') ||
        title.includes('memorandum') ||
        title.includes('mou') ||
        description.includes('regulation') ||
        description.includes('compliance') ||
        description.includes('memorandum')) {
        return 'Regulation & Compliance';
    }

    // Funding & Investment
    if (title.includes('funding') ||
        title.includes('investment') ||
        title.includes('grant') ||
        title.includes('honours') ||
        description.includes('funding') ||
        description.includes('investment') ||
        description.includes('grant')) {
        return 'Funding & Investment';
    }

    // Default to Research & Analysis for AI-related documents
    return 'Research & Analysis';
}

// Function to determine business impact
function determineBusinessImpact(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();

    if (title.includes('strategy') ||
        title.includes('plan') ||
        title.includes('framework') ||
        description.includes('strategic') ||
        description.includes('high impact')) {
        return 'High Impact';
    }

    if (title.includes('guidance') ||
        title.includes('standards') ||
        description.includes('guidance')) {
        return 'Strategic';
    }

    return 'Background';
}

// Function to determine sector focus
function determineSectorFocus(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();
    const dept = doc.dept.toLowerCase();

    if (dept.includes('education') || title.includes('education')) {
        return 'Education';
    }

    if (dept.includes('treasury') || title.includes('financial') || title.includes('city')) {
        return 'Financial Services';
    }

    if (dept.includes('home office') || title.includes('police') || title.includes('safety')) {
        return 'Public Safety';
    }

    if (title.includes('business') || title.includes('trade') || title.includes('corporate')) {
        return 'Business & Trade';
    }

    if (title.includes('digital') || title.includes('data') || title.includes('datasets')) {
        return 'Digital Infrastructure';
    }

    return 'Cross-Sector';
}

// Function to determine AI application
function determineAIApplication(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();

    if (title.includes('skills') || title.includes('work') || title.includes('jobs')) {
        return 'Workforce & Skills';
    }

    if (title.includes('safety') || title.includes('security') || title.includes('ethics')) {
        return 'Safety & Security';
    }

    if (title.includes('data') || title.includes('datasets')) {
        return 'Data & Analytics';
    }

    if (title.includes('science') || title.includes('research')) {
        return 'Innovation & R&D';
    }

    if (title.includes('guidance') || title.includes('implementation')) {
        return 'Governance';
    }

    return 'Innovation & R&D';
}

// Function to determine stage
function determineStage(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();

    if (title.includes('action plan') || title.includes('dashboard')) {
        return 'Active';
    }

    if (title.includes('strategy') || title.includes('framework')) {
        return 'Active';
    }

    if (title.includes('assessment') || title.includes('analysis')) {
        return 'Active';
    }

    return 'Active';
}

// Function to determine audience
function determineAudience(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();
    const format = doc.format.toLowerCase();

    if (format.includes('guidance') || title.includes('guidance')) {
        return 'Business/Private Sector';
    }

    if (doc.dept === 'DfE' || title.includes('education')) {
        return 'Education Sector';
    }

    if (doc.dept === 'Treasury' || title.includes('financial')) {
        return 'Financial Services';
    }

    return 'Government/Public Sector';
}

// Function to generate AI summary
function generateAISummary(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();

    if (title.includes('ai opportunities action plan')) {
        return 'Interactive dashboard tracking progress on AI opportunities action plan initiatives.';
    }

    if (title.includes('ai capabilities') && title.includes('labour market')) {
        return 'Assessment of AI capability development and potential impacts on UK labour market.';
    }

    if (title.includes('ai skills for life and work')) {
        return 'Research on AI skills development for life and work, including expert and public perspectives.';
    }

    if (title.includes('datasets ready for ai')) {
        return 'Guidelines for preparing government datasets to enable AI applications and innovation.';
    }

    if (title.includes('generative ai') && title.includes('safety')) {
        return 'Safety standards for generative AI products in educational settings.';
    }

    // Generic AI summary based on description
    if (description.includes('ai') || description.includes('artificial intelligence')) {
        return description.length > 100 ? description.substring(0, 97) + '...' : description;
    }

    return `AI-related ${doc.format || 'document'}: ${doc.title}`;
}

// Function to extract primary topic
function extractPrimaryTopic(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();

    if (title.includes('opportunities') || title.includes('action plan')) return 'AI Opportunities';
    if (title.includes('capabilities') || title.includes('labour market')) return 'AI Capabilities';
    if (title.includes('skills') || title.includes('work')) return 'AI Skills';
    if (title.includes('datasets')) return 'Data Readiness';
    if (title.includes('safety') || title.includes('standards')) return 'AI Safety';
    if (title.includes('science')) return 'AI for Science';
    if (title.includes('champions') || title.includes('financial')) return 'AI in Finance';
    if (title.includes('corruption') || title.includes('strategy')) return 'Anti-Corruption';

    return 'AI Policy';
}

// Function to extract key topics
function extractKeyTopics(doc: NewAIDocument): string {
    const topics = [];
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();

    if (title.includes('ai') || description.includes('ai')) topics.push('AI');
    if (title.includes('skills') || description.includes('skills')) topics.push('Skills');
    if (title.includes('safety') || description.includes('safety')) topics.push('Safety');
    if (title.includes('data') || description.includes('data')) topics.push('Data');
    if (title.includes('research') || description.includes('research')) topics.push('Research');
    if (title.includes('guidance') || description.includes('guidance')) topics.push('Guidance');
    if (title.includes('opportunities') || description.includes('opportunities')) topics.push('Opportunities');
    if (title.includes('implementation') || description.includes('implementation')) topics.push('Implementation');

    return topics.length > 0 ? topics.join(', ') : 'AI policy';
}

// Function to determine priority category
function determinePriorityCategory(doc: NewAIDocument): string {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();
    const dept = doc.dept;

    // High priority for action plans, strategies, and frameworks
    if (title.includes('action plan') || title.includes('strategy') || title.includes('framework')) {
        return '2-High';
    }

    // High priority for DSIT documents
    if (dept === 'DSIT') {
        return '2-High';
    }

    // Medium priority for guidance and research
    if (title.includes('guidance') || title.includes('research') || title.includes('assessment')) {
        return '3-Medium';
    }

    return '3-Medium';
}

// Function to determine recency
function determineRecency(publishedDate: string): string {
    const pubDate = new Date(publishedDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 30) return 'Last month';
    if (daysDiff <= 90) return 'Last 3 months';
    if (daysDiff <= 365) return 'Last year';
    return 'Over 2 years ago';
}

// Main transformation function
export function transformNewDocuments(): Policy[] {
    try {
        // Read the new CSV file
        const csvPath = path.join(process.cwd(), 'data', 'new_ai_documents_filtered_2026-01-30.csv');

        if (!fs.existsSync(csvPath)) {
            throw new Error('New AI documents file not found');
        }

        const csvData = fs.readFileSync(csvPath, 'utf-8');

        // Parse the new CSV
        const parseResult = Papa.parse<NewAIDocument>(csvData, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false
        });

        if (parseResult.errors.length > 0) {
            console.error('CSV parsing errors:', parseResult.errors);
        }

        // Transform each document to match the Policy interface
        const transformedPolicies: Policy[] = parseResult.data.map((doc, index) => {
            const publishedDate = new Date(doc.published_date);
            const collectionDate = new Date('2026-01-30'); // Current date

            return {
                dept: doc.dept,
                dept_group: mapDeptToGroup(doc.dept),
                title: doc.title,
                published_date: publishedDate.toISOString(),
                year: publishedDate.getFullYear(),
                month: publishedDate.getMonth() + 1,
                month_name: publishedDate.toLocaleString('default', { month: 'long' }),
                quarter: Math.ceil((publishedDate.getMonth() + 1) / 3),
                quarter_label: `Q${Math.ceil((publishedDate.getMonth() + 1) / 3)} ${publishedDate.getFullYear()}`,
                year_month: `${publishedDate.getFullYear()}-${String(publishedDate.getMonth() + 1).padStart(2, '0')}`,
                relevance_score: 0.8, // Default relevance score for AI documents
                priority_category: determinePriorityCategory(doc),
                requires_action: 'No', // Default value
                policy_type: categorizePolicyType(doc),
                business_impact: determineBusinessImpact(doc),
                sector_focus: determineSectorFocus(doc),
                ai_application: determineAIApplication(doc),
                stage: determineStage(doc),
                audience: determineAudience(doc),
                ai_summary: generateAISummary(doc),
                primary_topic: extractPrimaryTopic(doc),
                key_topics: extractKeyTopics(doc),
                recency: determineRecency(doc.published_date),
                days_since_published: Math.floor((new Date().getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)),
                summary_word_count: doc.description.split(' ').length,
                topics_count: extractKeyTopics(doc).split(', ').length,
                description: doc.description,
                url: doc.url,
                format: doc.format,
                display_type: doc.display_type || doc.format,
                collection_date: collectionDate.toISOString(),
                core_obligations: [],
                source_quote: null,
                status: 'live',
            };
        });

        return transformedPolicies;
    } catch (error) {
        console.error('Error transforming new documents:', error);
        throw error;
    }
}

// Helper function to map department to department group
function mapDeptToGroup(dept: string): string {
    const deptMapping: Record<string, string> = {
        'DSIT': 'Innovation & Business',
        'Treasury': 'Finance & Economy',
        'DfE': 'Education',
        'Home_Office': 'Security & Justice',
        'DBT': 'Business & Trade',
        'ICO': 'Regulation & Compliance'
    };

    return deptMapping[dept] || 'Other';
}

// Function to save transformed data
export function saveTransformedData(): void {
    try {
        const transformedData = transformNewDocuments();

        // Convert to CSV
        const csv = Papa.unparse(transformedData);

        // Save to new file
        const outputPath = path.join(process.cwd(), 'data', 'uk_ai_policy_with_new_documents.csv');
        fs.writeFileSync(outputPath, csv, 'utf-8');

        console.log(`Transformed ${transformedData.length} documents saved to ${outputPath}`);
    } catch (error) {
        console.error('Error saving transformed data:', error);
        throw error;
    }
}
