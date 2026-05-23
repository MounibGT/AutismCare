const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');

let parenDepth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const before = parenDepth;
  for (let ch of line) {
    if (ch === '(') parenDepth++;
    if (ch === ')') parenDepth--;
  }
  if (before !== parenDepth) {
    console.log(`Line ${i+1} (${line.trim().slice(0,50)}) -> paren count: ${before} -> ${parenDepth}`);
  }
}

console.log(`Final paren count: ${parenDepth}`);
