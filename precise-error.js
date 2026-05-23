const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
// Try parse with detailed error
try {
  JSON.parse(data);
  console.log('Valid');
} catch(e) {
  console.error('Error:', e.message);
  console.error('At position', e.position);
  // Find line/col
  let line = 1, col = 1;
  for (let i = 0; i < e.position; i++) {
    if (data[i] === '\n') { line++; col = 1; }
    else col++;
  }
  console.error('At line', line, 'col', col);
  // Show context
  const start = Math.max(0, e.position - 40);
  const end = Math.min(data.length, e.position + 40);
  console.error('Context:', data.substring(start, end));
}