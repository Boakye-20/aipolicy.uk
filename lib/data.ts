import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Policy } from '@/types/policy';

export function getPolicies(): Policy[] {
    try {
        // Read the filtered CSV file from the data directory
        const csvPath = path.join(process.cwd(), 'data', 'uk_ai_policy_filtered_v1.csv');

        // Check if file exists
        if (!fs.existsSync(csvPath)) {
            throw new Error('Data file not found. Please ensure uk_ai_policy_filtered_v1.csv is in the /data folder.');
        }

        const csvData = fs.readFileSync(csvPath, 'utf-8');

        // Parse CSV with explicit type conversion
        const parseResult = Papa.parse<Policy>(csvData, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            transform: (value, field) => {
                // Convert numeric fields to numbers
                const fieldName = String(field);
                if (['year', 'month', 'quarter', 'days_since_published', 'summary_word_count', 'topics_count'].includes(fieldName)) {
                    return value ? Number(value) : 0;
                }
                return value;
            },
        });

        if (parseResult.errors.length > 0) {
            console.error('CSV parsing errors:', parseResult.errors);
        }

        return parseResult.data;
    } catch (error) {
        console.error('Error reading policy data:', error);
        throw error;
    }
}

export function filterPolicies(policies: Policy[], filters: {
    dept?: string | null;
    priority?: string | null;
    policyType?: string | null;
    sector?: string | null;
    aiApplication?: string | null;
}): Policy[] {
    return policies.filter(policy => {
        if (filters.dept && policy.dept !== filters.dept) return false;
        if (filters.policyType && policy.policy_type !== filters.policyType) return false;
        if (filters.aiApplication && policy.ai_application !== filters.aiApplication) return false;
        if (filters.priority && policy.priority_category !== filters.priority) return false;
        if (filters.sector && policy.sector_focus !== filters.sector) return false;
        return true;
    });
}
