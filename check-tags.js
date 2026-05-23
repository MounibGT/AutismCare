const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');

// Simple tag balance checker for JSX
const stack = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Find all opening tags <TagName
  const openTags = line.match(/<[A-Za-z][A-Za-z0-9]*/g) || [];
  // Find all closing tags </TagName>
  const closeTags = line.match(/<\/[A-Za-z][A-Za-z0-9]*>/g) || [];
  // Find self-closing tags <.../>
  const selfClose = line.match(/<[A-Za-z][A-Za-z0-9]*[^>]*\/>/g) || [];
  
  openTags.forEach(tag => {
    const tagName = tag.slice(1);
    if (tagName !== 'br' && tagName !== 'hr' && tagName !== 'img' && tagName !== 'input' && tagName !== 'link' && tagName !== 'meta' && !line.trim().endsWith('/>')) {
      stack.push({tag: tagName, line: i+1});
    }
  });
  
  closeTags.forEach(tag => {
    const tagName = tag.slice(2, -1);
    if (stack.length && stack[stack.length-1].tag === tagName) {
      stack.pop();
    } else {
      console.log(`Line ${i+1}: Unexpected closing tag </${tagName}>. Stack top: ${stack.length ? stack[stack.length-1].tag : 'empty'}`);
    }
  });
}

console.log('\nUnclosed tags:');
stack.forEach(item => console.log(`  ${item.tag} opened at line ${item.line}`));
