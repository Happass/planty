// Connection test script for production API
// Run with: node test-connection.js

const BASE_URL = process.env.BASE_URL || 'https://planty-api.shakenokiri.me/';

async function testConnection() {
  console.log(`🔍 Testing connection to: ${BASE_URL}`);
  
  try {
    // Test basic connectivity
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Start-Screen-API-Test/1.0.0'
      }
    });
    
    console.log(`✅ Connection successful!`);
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.text();
    console.log(`Response: ${data}`);
    
    // Test if it's JSON
    try {
      const jsonData = JSON.parse(data);
      console.log(`✅ Valid JSON response`);
      console.log(`JSON:`, JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(`⚠️ Response is not JSON: ${data}`);
    }
    
  } catch (error) {
    console.log(`❌ Connection failed:`);
    console.log(`Error: ${error.message}`);
    console.log(`Error type: ${error.name}`);
    console.log(`Stack: ${error.stack}`);
    
    // Provide troubleshooting suggestions
    console.log(`\n🔧 Troubleshooting suggestions:`);
    console.log(`1. Check if the API server is running`);
    console.log(`2. Verify the URL is correct: ${BASE_URL}`);
    console.log(`3. Check network connectivity`);
    console.log(`4. Verify SSL certificate is valid`);
    console.log(`5. Check if CORS is properly configured`);
  }
}

// Run the test
testConnection();
