const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');

let parenStack = []; // store {line, col}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '(') {
      parenStack.push({line: i+1, col: j+1, char: '('});
    } else if (ch === ')') {
      if (parenStack.length) {
        const match = parenStack.pop();
        // Check if this matches the return '(' around line 237
        if (match.line === 237) {
          console.log(`Line ${i+1}, col ${j+1}: ')' matches the '(' from line 237 (return)`);
        }
      } else {
        // console.log extra
      }
    }
  }
}

console.log('Unmatched opens:');
parenStack.forEach(p => console.log(`  '(' at line ${p.line} col ${p.col}`));
