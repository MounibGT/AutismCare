const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
// Find the billing section using more careful parsing
let i = data.indexOf('"billing"');
if (i === -1) {
  console.log('No billing key found');
} else {
  console.log('Found billing at index', i);
  console.log('Context:', data.substring(i, i+200));
}
// Also count braces from start to find imbalance
let depth = 0, lastDepth0 = -1;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') depth++;
  else if (data[i] === '}') {
    depth--;
    if (depth === 0) lastDepth0 = i;
  }
}
console.log('Last depth=0 at', lastDepth0, 'char:', data[lastDepth0]);
console.log('After that:', JSON.stringify(data.substring(lastDepth0, lastDepth0+30)));