const en = require('./messages/en.json');
console.log('Root keys:', Object.keys(en));
console.log('Has root billing?', !!en.billing);
if (en.billing) console.log('Root billing keys:', Object.keys(en.billing));
else {
  // Search for any billing at root
  for (const [k,v] of Object.entries(en)) {
    if (v && typeof v === 'object' && v.billing) {
      console.log('Found nested billing under', k);
    }
  }
}