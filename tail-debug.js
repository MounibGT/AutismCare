const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
const lines = data.split('\n');
for (let i = 195; i < lines.length; i++) {
  console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}