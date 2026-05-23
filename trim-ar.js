const fs = require('fs');
let data = fs.readFileSync('./messages/ar.json', 'utf8');
// Remove trailing whitespace and braces beyond the root object
// Find the position of the final closing brace of the root object
let depth = 0;
let lastCloseAt = -1;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') depth++;
  else if (data[i] === '}') {
    depth--;
    if (depth === 0) {
      lastCloseAt = i;
    }
  }
}
if (lastCloseAt !== -1) {
  // Keep content up to and including the last root closing brace
  data = data.substring(0, lastCloseAt + 1);
}
// Write back
fs.writeFileSync('./messages/ar.json', data);
console.log('Trimmed to depth 0 at position', lastCloseAt);
// Validate
try {
  JSON.parse(data);
  console.log('JSON valid');
} catch(e) {
  console.error('Still invalid:', e.message);
}