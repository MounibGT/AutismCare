const fs = require('fs');
const files = [
  'src/components/payments/PaymentModal.tsx',
  'src/components/payments/AddPaymentMethodModal.tsx',
  'src/components/payments/GuestPaymentForm.tsx'
];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let inTemplate = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('${') || lines[i].includes('`')) {
        // Might be template literal
      }
    }
    // Try to parse to find syntax errors roughly
    try {
      new Function(content);
      console.log(`✓ ${file} parses OK`);
    } catch (e) {
      console.log(`✗ ${file}: ${e.message}`);
    }
  } catch (e) {
    console.log(`! ${file}: ${e.message}`);
  }
});
