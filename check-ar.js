const fs = require('fs');
try {
  const data = fs.readFileSync('./messages/ar.json', 'utf8');
  JSON.parse(data);
  console.log('Valid JSON');
} catch (e) {
  console.error('Error:', e.message);
  console.error('Position:', e.position);
  if (e.position !== undefined) {
    console.log('Context:', data.substring(Math.max(0, e.position-50), e.position+50));
  }
}