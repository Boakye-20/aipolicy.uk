const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');
const path = require('path');

const inputFile = path.join(__dirname, '../data/uk_ai_policy_filtered.csv');
const outputFile = path.join(__dirname, '../data/uk_ai_policy_filtered_v2.csv');

// First, filter out explicitly non-AI policies
const isNotAI = (policy) => {
  const summary = (policy.ai_summary || '').toLowerCase();
  
  return (
    summary.includes('does not address artificial intelligence') ||
    summary.includes('does not involve artificial intelligence') ||
    summary.includes('not about ai') ||
    summary.includes('no ai content')
  );
};

// We'll take the first 515 policies that pass the basic AI check
const TARGET_COUNT = 515;

const policies = [];
const headers = [];
let isHeader = true;

// Read and process the CSV file
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('headers', (headerList) => {
    headers.push(...headerList);
  })
  .on('data', (row) => {
    if (!isNotAI(row) && policies.length < TARGET_COUNT) {
      policies.push(row);
    }
  })
  .on('end', () => {
    console.log(`Filtered ${policies.length} AI-relevant policies`);
    
    if (policies.length < TARGET_COUNT) {
      console.warn(`Warning: Only found ${policies.length} policies, which is less than the target of ${TARGET_COUNT}`);
    } else if (policies.length > TARGET_COUNT) {
      console.log(`Taking first ${TARGET_COUNT} policies`);
      policies.length = TARGET_COUNT;
    }
    
    // Write the filtered policies to a new CSV file
    const stringifier = stringify({ header: true, columns: headers });
    const writableStream = fs.createWriteStream(outputFile);
    
    stringifier.pipe(writableStream);
    
    for (const policy of policies) {
      stringifier.write(policy);
    }
    
    stringifier.end();
    
    console.log(`Filtered CSV written to ${outputFile}`);
    console.log(`Original count: 649, Filtered count: ${policies.length}`);
  });
