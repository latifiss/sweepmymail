/**
 * Quick test script to test email routes with your JWT token
 * 
 * Usage:
 * node test-with-token.js YOUR_JWT_TOKEN
 * 
 * Example:
 * node test-with-token.js eyJhbGciOiJI...
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:7000';
const token = process.argv[2];

if (!token) {
  console.error('❌ Please provide your JWT token as an argument');
  console.log('\nUsage: node test-with-token.js YOUR_JWT_TOKEN');
  console.log('\nExample:');
  console.log('node test-with-token.js eyJhbGciOiJI...');
  process.exit(1);
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testFetchEmails() {
  log('\n=== Testing: Fetch Emails ===', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/emails`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    log(`✅ Success! Fetched ${response.data.count || 0} emails`, 'green');
    console.log('\nSample emails:');
    (response.data.emails?.slice(0, 3) || []).forEach((email, i) => {
      console.log(`\n${i + 1}. From: ${email.sender}`);
      console.log(`   Subject: ${email.subject || 'No subject'}`);
      console.log(`   Date: ${email.date}`);
    });
    return response.data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testGroupedEmails() {
  log('\n=== Testing: Grouped Emails ===', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/emails/grouped`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    log(`✅ Success! Found ${response.data.groups?.length || 0} email groups`, 'green');
    console.log('\nTop 10 senders:');
    (response.data.groups?.slice(0, 10) || []).forEach((group, i) => {
      console.log(`${i + 1}. ${group.key || group.sender}: ${group.count} emails`);
    });
    return response.data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testGetBySender() {
  log('\n=== Testing: Get Emails by Sender ===', 'cyan');
  try {
    // Try to get emails from a common sender
    const response = await axios.get(`${BASE_URL}/emails/by-sender`, {
      params: { sender: 'newsletter' },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    log(`✅ Success! Found ${response.data.count || 0} emails matching "newsletter"`, 'green');
    return response.data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Testing Gmail API Routes\n');
  console.log('='.repeat(50));
  log(`Using token: ${token.substring(0, 20)}...`, 'yellow');
  
  try {
    // Test 1: Fetch emails
    await testFetchEmails();
    
    // Test 2: Get grouped emails
    await testGroupedEmails();
    
    // Test 3: Get emails by sender
    await testGetBySender();
    
    console.log('\n' + '='.repeat(50));
    log('\n✅ All tests completed!', 'green');
    console.log('\n💡 Tip: Save your token for future requests!');
    console.log('   You can use it in the Authorization header:');
    console.log('   Authorization: Bearer YOUR_TOKEN\n');
    
  } catch (error) {
    log('\n❌ Some tests failed', 'red');
    process.exit(1);
  }
}

main();
