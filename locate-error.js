const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
try {
  JSON.parse(data);
  console.log('Valid');
} catch (e) {
  const pos = e.position;
  // Compute line and column
  let line = 1, col = 1;
  for (let i = 0; i < pos; i++) {
    if (data[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  console.log('Error at line', line, 'col', col);
  // Show snippet around pos
  console.log('Snippet:', data.substring(pos-100, pos+100));
}