import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database from CSV...');

  const csvPath = path.join(
    process.cwd(),
    'data',
    'uk_ai_policy_filtered_v1.csv'
  );

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`);
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');

  const parseResult = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  let successCount = 0;
  let skipCount = 0;

  for (const row of parseResult.data as any[]) {
    const policyUrl = row.url;
    if (!policyUrl || policyUrl.trim() === '') {
      skipCount++;
      continue;
    }

    try {
      const policyData = {
        dept: row.dept || null,
        dept_group: row.dept_group || null,
        title: row.title || 'Untitled',
        published_date: row.published_date ? new Date(row.published_date) : null,
        year: row.year ? parseInt(row.year, 10) : null,
        month: row.month ? parseInt(row.month, 10) : null,
        month_name: row.month_name || null,
        quarter: row.quarter ? parseInt(row.quarter, 10) : null,
        quarter_label: row.quarter_label || null,
        year_month: row.year_month || null,
        priority_category: row.priority_category || null,
        policy_type: row.policy_type || null,
        business_impact: row.business_impact || null,
        sector_focus: row.sector_focus || null,
        ai_application: row.ai_application || null,
        stage: row.stage || null,
        audience: row.audience || null,
        ai_summary: row.ai_summary || null,
        primary_topic: row.primary_topic || null,
        key_topics: row.key_topics || null,
        recency: row.recency || null,
        days_since_published: row.days_since_published ? parseInt(row.days_since_published, 10) : null,
        summary_word_count: row.summary_word_count ? parseInt(row.summary_word_count, 10) : null,
        topics_count: row.topics_count ? parseInt(row.topics_count, 10) : null,
        url: policyUrl,
      };

      await prisma.policy.upsert({
        where: { url: policyUrl },
        update: policyData,
        create: policyData,
      });

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`  Seeded ${successCount} policies...`);
      }
    } catch (e) {
      console.error(`Error seeding policy ${policyUrl}:`, (e as Error).message);
    }
  }

  console.log(`\nSeeding complete: ${successCount} policies added/updated, ${skipCount} skipped`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
