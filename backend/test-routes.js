/**
 * Test script for Gmail API routes
 * 
 * Usage:
 * 1. Start the server: npm run dev
 * 2. Run this script: node test-routes.js
 * 
 * This script will help you test the authentication and email routes.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:7000';
let authToken = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testGoogleAuthUrl() {
  logInfo('\n=== Testing Google Auth URL ===');
  try {
    const response = await axios.get(`${BASE_URL}/auth/google/url`);
    logSuccess('Google Auth URL retrieved successfully');
    console.log('\n📋 Google Auth URL:');
    console.log(response.data.url);
    console.log('\n👉 Copy this URL and open it in your browser to authenticate');
    console.log('👉 After authentication, you will be redirected to the callback URL');
    console.log('👉 Copy the "code" parameter from the callback URL');
    return response.data.url;
  } catch (error) {
    logError(`Failed to get Google Auth URL: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testGoogleCallback(code) {
  logInfo('\n=== Testing Google Callback ===');
  if (!code) {
    logWarning('No authorization code provided. Skipping callback test.');
    logInfo('To test this:');
    logInfo('1. Get the auth URL from the previous test');
    logInfo('2. Open it in your browser and authenticate');
    logInfo('3. Copy the "code" parameter from the redirect URL');
    logInfo('4. Run: node test-routes.js <code>');
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/auth/google/callback`, {
      params: { code }
    });
    logSuccess('Google Callback successful');
    console.log('\n📋 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      authToken = response.data.token;
      logSuccess(`Auth token saved: ${authToken.substring(0, 20)}...`);
    }
    
    return response.data;
  } catch (error) {
    logError(`Failed to complete Google Callback: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testFetchEmails() {
  logInfo('\n=== Testing Fetch Emails ===');
  if (!authToken) {
    logWarning('No auth token available. Please authenticate first.');
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/emails`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    logSuccess(`Fetched ${response.data.count || 0} emails`);
    console.log('\n📋 Response:');
    console.log(JSON.stringify({
      ok: response.data.ok,
      count: response.data.count,
      sampleEmails: response.data.emails?.slice(0, 3) || []
    }, null, 2));
    return response.data;
  } catch (error) {
    logError(`Failed to fetch emails: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testGroupedEmails() {
  logInfo('\n=== Testing Grouped Emails ===');
  if (!authToken) {
    logWarning('No auth token available. Please authenticate first.');
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/emails/grouped`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    logSuccess(`Retrieved ${response.data.groups?.length || 0} email groups`);
    console.log('\n📋 Top 5 Groups:');
    const topGroups = response.data.groups?.slice(0, 5) || [];
    topGroups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.key || group.sender}: ${group.count} emails`);
    });
    return response.data;
  } catch (error) {
    logError(`Failed to get grouped emails: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testGetBySender(sender = 'newsletter') {
  logInfo(`\n=== Testing Get By Sender (${sender}) ===`);
  if (!authToken) {
    logWarning('No auth token available. Please authenticate first.');
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/emails/by-sender`, {
      params: { sender },
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    logSuccess(`Found ${response.data.count || 0} emails from "${sender}"`);
    console.log('\n📋 Sample Messages:');
    const samples = response.data.messages?.slice(0, 3) || [];
    samples.forEach((msg, index) => {
      console.log(`${index + 1}. From: ${msg.sender}`);
      console.log(`   Subject: ${msg.subject}`);
      console.log(`   Date: ${msg.date}`);
      console.log('');
    });
    return response.data;
  } catch (error) {
    logError(`Failed to get emails by sender: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testHealthCheck() {
  logInfo('\n=== Testing Health Check ===');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    logSuccess('Server is running');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    logError(`Server health check failed: ${error.message}`);
    logWarning('Make sure the server is running: npm run dev');
    return false;
  }
}

async function main() {
  console.log('\n🚀 Gmail API Routes Test Script\n');
  console.log('='.repeat(50));
  
  const code = process.argv[2]; // Get code from command line argument
  
  try {
    // Test 1: Health check
    const isHealthy = await testHealthCheck();
    if (!isHealthy) {
      logError('\nServer is not running. Please start it with: npm run dev');
      process.exit(1);
    }

    // Test 2: Get Google Auth URL
    const authUrl = await testGoogleAuthUrl();
    
    // Test 3: Test callback if code provided
    if (code) {
      await testGoogleCallback(code);
      
      // Test 4: Fetch emails (requires authentication)
      await testFetchEmails();
      
      // Test 5: Get grouped emails
      await testGroupedEmails();
      
      // Test 6: Get emails by sender
      await testGetBySender();
    } else {
      logWarning('\n⚠️  No authorization code provided.');
      logInfo('\nTo complete the full test:');
      logInfo('1. Copy the Google Auth URL above');
      logInfo('2. Open it in your browser');
      logInfo('3. Authenticate with your Google account');
      logInfo('4. After redirect, copy the "code" parameter from the URL');
      logInfo('5. Run: node test-routes.js <code>');
    }

    console.log('\n' + '='.repeat(50));
    logSuccess('\n✅ Test script completed!\n');
    
  } catch (error) {
    logError('\n❌ Test script failed');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
main();
