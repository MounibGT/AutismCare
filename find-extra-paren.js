const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');

let parenStack = []; // store line numbers of '('

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '(') {
      parenStack.push({line: i+1, col: j+1});
    } else if (ch === ')') {
      if (parenStack.length) {
        parenStack.pop();
      } else {
        console.log(`Line ${i+1}, col ${j+1}: Unexpected ')' without matching '('`);
        console.log(`  ${line.trim()}`);
      }
    }
  }
}

if (parenStack.length) {
  console.log('Unclosed parentheses at:');
  parenStack.forEach(p => console.log(`  line ${p.line} col ${p.col}`));
} else {
  console.log('All parentheses matched.');
}
