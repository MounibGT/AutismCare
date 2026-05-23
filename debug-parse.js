const fs = require('fs');
const files = [
  'src/components/payments/CheckoutForm.tsx',
  'src/components/payments/GuestPaymentForm.tsx'
];
files.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    // Try to parse as JS
    try {
      new Function(content);
      console.log('✓ ' + f + ' parses');
    } catch(e) {
      console.log('✗ ' + f + ' parse error: ' + e.message);
      // Find line with error
      const lines = content.split('\n');
      const match = e.message.match(/\((\d+):(\d+)\)/);
      if (match) {
        const line = parseInt(match[1])-1;
        console.log('  Line '+(line+1)+': ' + JSON.stringify(lines[line]));
      }
    }
  } catch(e) {
    console.log('! ' + f + ' read error: ' + e.message);
  }
});
