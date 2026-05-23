const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');

// Count between line 237 (index 236) and line 478 (index 477) inclusive
let opens = 0, closes = 0;
for (let i = 236; i <= 477; i++) {
  const line = lines[i];
  for (let ch of line) {
    if (ch === '(') opens++;
    if (ch === ')') closes++;
  }
}
console.log(`From line 237 to 478: opens=${opens}, closes=${closes}, net=${opens-closes}`);
