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
  const csvData = fs.readFileSync(csvPath, 'utf-8');

  const parseResult = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // We will handle type conversion manually
  });

  for (const row of parseResult.data as any[]) {
    // The URL is the unique identifier for each policy.
    const policyUrl = row.url;
    if (!policyUrl) continue;

    const policyData = {
      ...row,
      // Convert string dates to Date objects, or null if invalid
      published_date: row.published_date
        ? new Date(row.published_date)
        : null,
      // Convert string numbers to actual numbers, or null if empty/invalid
      year: row.year ? parseInt(row.year, 10) : null,
      month: row.month ? parseInt(row.month, 10) : null,
      quarter: row.quarter ? parseInt(row.quarter, 10) : null,
      days_since_published: row.days_since_published
        ? parseInt(row.days_since_published, 10)
        : null,
      summary_word_count: row.summary_word_count
        ? parseInt(row.summary_word_count, 10)
        : null,
      topics_count: row.topics_count ? parseInt(row.topics_count, 10) : null,
    };

    await prisma.policy.upsert({
      where: { url: policyUrl },
      update: policyData,
      create: policyData,
    });
  }

  console.log(`Seeding finished. ${parseResult.data.length} policies processed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });