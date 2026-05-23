const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
let opens = 0, closes = 0;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') opens++;
  else if (data[i] === '}') closes++;
}
console.log('Open braces:', opens, 'Close braces:', closes, 'Diff:', opens - closes);

// Find first few unclosed positions
let depth = 0;
for (let i = 0; i < Math.min(data.length, 50000); i++) {
  if (data[i] === '{') depth++;
  else if (data[i] === '}') depth--;
}
console.log('Depth after 50k chars:', depth);