const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 469; i < 480; i++) {
  if (lines[i]) {
    console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
  }
}
