const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
console.log('Char at 7508:', JSON.stringify(data[7508]));
console.log('Context 7500-7512:', JSON.stringify(data.substring(7500, 7512)));
// Count braces
let depth = 0;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') depth++;
  else if (data[i] === '}') depth--;
  if (depth === 0 && i < data.length - 1) {
    console.log(`Closed at ${i}, remaining: ${JSON.stringify(data.substring(i+1, i+21))}`);
  }
}
console.log('Final depth:', depth);