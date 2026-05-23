const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
try {
  JSON.parse(data);
  console.log('Valid');
} catch (e) {
  const pos = e.position;
  const lines = data.substring(0, pos).split('\n');
  console.log('Error at line', lines.length, 'col', pos - lines.reduce((acc, line) => acc + line.length + 1, 0) + 1);
  console.log('Line content:', lines[lines.length-1]);
  console.log('Next line:', data.split('\n')[lines.length]);
}