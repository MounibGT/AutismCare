const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');
const lines = content.split('\n');

let braceDepth = 0;
let parenDepth = 0;
let bracketDepth = 0;
let inJSX = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Track JSX context roughly
  if (line.includes('<') && line.includes('>')) inJSX = true;
  
  for (let ch of line) {
    if (ch === '{') braceDepth++;
    if (ch === '}') braceDepth--;
    if (ch === '(') parenDepth++;
    if (ch === ')') parenDepth--;
    if (ch === '[') bracketDepth++;
    if (ch === ']') bracketDepth--;
  }
  
  if (braceDepth < 0 || parenDepth < 0 || bracketDepth < 0) {
    console.log(`Line ${i+1}: Unbalanced - braces:${braceDepth} parens:${parenDepth} brackets:${bracketDepth}`);
    console.log(`  ${line}`);
  }
}

console.log(`Final: braces:${braceDepth} parens:${parenDepth} brackets:${bracketDepth}`);
