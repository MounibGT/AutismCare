const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
let depth = 0;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') depth++;
  else if (data[i] === '}') depth--;
}
console.log('Braces balance:', depth); // should be 0

// Show first unbalanced position
let stack = [];
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') stack.push(i);
  else if (data[i] === '}') {
    if (stack.length === 0) {
      console.log('Extra } at position', i);
      break;
    }
    stack.pop();
  }
}
if (stack.length) console.log('Unclosed { at positions', stack);
else console.log('Braces matched');

// Also search for "billing" to see duplicates
const matches = [...data.matchAll(/"billing"\s*:/g)];
console.log('Number of "billing" keys:', matches.length);
matches.forEach((m, idx) => {
  console.log(`Match ${idx+1} at index ${m.index}`);
});