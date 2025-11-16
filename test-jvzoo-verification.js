import crypto from 'crypto';

// Test JVZoo verification with actual IPN data received
const secretKey = 'gJaCwAjandC2mweg1Tmw';

const ipnData = {
  caffitid: '',
  ccustcc: 'RO',
  ccustemail: 'mushynelu@gmail.com',
  ccustname: 'Bogdan Isfan',
  ccuststate: '',
  cproditem: '427079',
  cprodtitle: 'AdGenius AI – AI-Powered Ad Creative Software',
  cprodtype: 'RECURRING',
  ctransaction: 'SALE',
  ctransaffiliate: '0',
  ctransamount: '1.00',
  ctranspaymentmethod: 'WHOP',
  ctransreceipt: '9U7RZQUFAKHBEVWJU',
  ctranstime: '1763301430',
  ctransvendor: '3009471',
  cupsellreceipt: '',
  cvendthru: 'c=TP-cRosfAhZDoHBupMSXDsY',
  cverify: 'DC782462'
};

console.log('\n=== Testing JVZoo IPN Verification ===\n');

const { cverify, ...otherFields } = ipnData;

// Sort field names alphabetically
const sortedKeys = Object.keys(otherFields).sort();
console.log('Sorted field names:', sortedKeys);

// Build verification string: value1|value2|...|valueN|secretKey
const values = sortedKeys.map(key => otherFields[key] || '');
const verificationString = values.join('|') + '|' + secretKey;

console.log('\nVerification string:', verificationString);

// Calculate SHA-1 hash
const fullHash = crypto
  .createHash('sha1')
  .update(verificationString, 'utf8')
  .digest('hex')
  .toUpperCase();

// JVZoo uses only the FIRST 8 characters
const calculatedHash = fullHash.substring(0, 8);

console.log('\nFull SHA1 hash:', fullHash);
console.log('Calculated hash (first 8):', calculatedHash);
console.log('Provided hash (from JVZoo):', cverify);

const isValid = calculatedHash === cverify.toUpperCase();

console.log('\n' + (isValid ? '✅ VERIFICATION SUCCESSFUL!' : '❌ VERIFICATION FAILED!'));

if (!isValid) {
  console.log('\nDEBUGGING INFO:');
  console.log('Expected:', cverify);
  console.log('Got:', calculatedHash);
  console.log('Difference:', calculatedHash !== cverify ? 'MISMATCH' : 'MATCH');
}

console.log('\n');
