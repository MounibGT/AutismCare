const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');

// Count parentheses from line 479 (index 478) to line 503 (index 502)
let opens = 0, closes = 0;
for (let i = 478; i <= 502; i++) {
  if (!lines[i]) continue;
  const line = lines[i];
  for (let ch of line) {
    if (ch === '(') opens++;
    if (ch === ')') closes++;
  }
}
console.log(`Lines 479-503: opens=${opens}, closes=${closes}, net=${opens-closes}`);

// Also print those lines raw
console.log('\nLines content:');
for (let i = 478; i <= 502; i++) {
  if (lines[i]) console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}
