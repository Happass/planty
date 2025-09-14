// Comprehensive API Test Suite for Start Screen API
// Run with: node test-suite.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:8787';
const LOCATION_ID = '9q8yy'; // Tokyo area geohash

let createdMemoryId = null;
let createdFlowerId = null;

// Test utilities
async function makeRequest(method, endpoint, body = null) {
  // Ensure proper URL construction
  const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${endpointPath}`;
  console.log(`Making request to: ${url}`);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.text();
    let jsonData = null;
    
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      // Not JSON response
      console.log(`Response is not JSON: ${data}`);
    }
    
    // Log error responses for debugging
    if (!response.ok) {
      console.log(`Error response (${response.status}): ${data}`);
    }
    
    return {
      status: response.status,
      data: jsonData || data,
      ok: response.ok
    };
  } catch (error) {
    console.log(`Fetch error: ${error.message}`);
    console.log(`URL: ${url}`);
    console.log(`Error type: ${error.name}`);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      console.log('This might be a network connectivity issue or SSL problem');
    }
    
    return {
      status: 0,
      data: error.message,
      ok: false
    };
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`✅ ${message}`);
}

function assertStatus(response, expectedStatus, message) {
  assert(response.status === expectedStatus, `${message} - Expected ${expectedStatus}, got ${response.status}`);
}

function assertHasProperty(obj, property, message) {
  assert(obj && typeof obj === 'object' && property in obj, `${message} - Missing property: ${property}`);
}

// Test cases
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const response = await makeRequest('GET', '/');
  console.log('Health check response:', JSON.stringify(response, null, 2));
  assertStatus(response, 200, 'Health check should return 200');
  assertHasProperty(response.data, 'message', 'Health check should have message');
  assert(response.data.message === 'Start Screen API', 'Health check message should match');
}

async function testCreateMemory() {
  console.log('\n📝 Testing Memory Creation...');
  const memoryData = {
    title: 'Test Memory',
    description: 'This is a test memory for API testing',
    memoryDate: '2024-01-15T18:30:00.000Z',
    lat: 35.6762,
    lon: 139.6503,
    locationName: 'Tokyo Station'
  };
  
  const response = await makeRequest('POST', `/locations/${LOCATION_ID}/memories`, memoryData);
  console.log('Memory creation response:', JSON.stringify(response, null, 2));
  assertStatus(response, 201, 'Memory creation should return 201');
  
  // Check if response.data is an object and has the required properties
  assert(response.data && typeof response.data === 'object', 'Response data should be an object');
  assert('id' in response.data, 'Memory should have ID');
  assert('title' in response.data, 'Memory should have title');
  assert('description' in response.data, 'Memory should have description');
  assert('lat' in response.data, 'Memory should have latitude');
  assert('lon' in response.data, 'Memory should have longitude');
  assert('locationId' in response.data, 'Memory should have locationId');
  
  createdMemoryId = response.data.id;
  console.log(`Created memory with ID: ${createdMemoryId}`);
}

async function testListMemories() {
  console.log('\n📋 Testing Memory Listing...');
  const response = await makeRequest('GET', `/locations/${LOCATION_ID}/memories?limit=10`);
  console.log('Memory listing response:', JSON.stringify(response, null, 2));
  assertStatus(response, 200, 'Memory listing should return 200');
  assert('items' in response.data, 'Response should have items array');
  assert(Array.isArray(response.data.items), 'Items should be an array');
  assert(response.data.items.length > 0, 'Should have at least one memory');
  
  const memory = response.data.items[0];
  assert('id' in memory, 'Memory should have ID');
  assert('title' in memory, 'Memory should have title');
  assert('description' in memory, 'Memory should have description');
}

async function testUpdateMemory() {
  console.log('\n✏️ Testing Memory Update...');
  if (!createdMemoryId) {
    console.log('⚠️ Skipping memory update test - no memory ID available');
    return;
  }
  
  const updateData = {
    title: 'Updated Test Memory',
    description: 'This is an updated test memory'
  };
  
  const response = await makeRequest('PATCH', `/memories/${createdMemoryId}`, updateData);
  console.log('Memory update response:', JSON.stringify(response, null, 2));
  assertStatus(response, 200, 'Memory update should return 200');
  assert(response.data.title === 'Updated Test Memory', 'Title should be updated');
  assert(response.data.description === 'This is an updated test memory', 'Description should be updated');
}

async function testCreateFlower() {
  console.log('\n🌸 Testing Flower Creation...');
  const flowerData = {
    lat: 35.6762,
    lon: 139.6503,
    texture: 'flower1',
    name: 'Test Cherry Blossom'
  };
  
  const response = await makeRequest('POST', '/flowers', flowerData);
  assertStatus(response, 201, 'Flower creation should return 201');
  assertHasProperty(response.data, 'id', 'Flower should have ID');
  assertHasProperty(response.data, 'lat', 'Flower should have latitude');
  assertHasProperty(response.data, 'lon', 'Flower should have longitude');
  assertHasProperty(response.data, 'texture', 'Flower should have texture');
  assertHasProperty(response.data, 'name', 'Flower should have name');
  assertHasProperty(response.data, 'type', 'Flower should have type');
  assert(response.data.type === 'mine', 'Flower type should be mine');
  
  createdFlowerId = response.data.id;
  console.log(`Created flower with ID: ${createdFlowerId}`);
}

async function testListFlowers() {
  console.log('\n🌺 Testing Flower Listing...');
  const response = await makeRequest('GET', '/flowers?limit=10');
  assertStatus(response, 200, 'Flower listing should return 200');
  assertHasProperty(response.data, 'items', 'Response should have items array');
  assert(Array.isArray(response.data.items), 'Items should be an array');
  assert(response.data.items.length > 0, 'Should have at least one flower');
  
  const flower = response.data.items[0];
  assertHasProperty(flower, 'id', 'Flower should have ID');
  assertHasProperty(flower, 'lat', 'Flower should have latitude');
  assertHasProperty(flower, 'lon', 'Flower should have longitude');
  assertHasProperty(flower, 'texture', 'Flower should have texture');
  assertHasProperty(flower, 'name', 'Flower should have name');
}

async function testFlowerBBoxFilter() {
  console.log('\n🗺️ Testing Flower BBox Filter...');
  const bbox = '139.6,35.6,139.7,35.7'; // Tokyo area
  const response = await makeRequest('GET', `/flowers?bbox=${bbox}&limit=10`);
  assertStatus(response, 200, 'Flower BBox filter should return 200');
  assertHasProperty(response.data, 'items', 'Response should have items array');
  assert(Array.isArray(response.data.items), 'Items should be an array');
}

async function testFlowerOwnerFilter() {
  console.log('\n👤 Testing Flower Owner Filter...');
  const response = await makeRequest('GET', '/flowers?owner=me&limit=10');
  assertStatus(response, 200, 'Flower owner filter should return 200');
  assertHasProperty(response.data, 'items', 'Response should have items array');
  assert(Array.isArray(response.data.items), 'Items should be an array');
}

async function testValidationErrors() {
  console.log('\n🚫 Testing Validation Errors...');
  
  // Test invalid memory data
  const invalidMemory = {
    title: '', // Empty title should fail
    description: 'Test',
    lat: 200, // Invalid latitude
    lon: 200  // Invalid longitude
  };
  
  const memoryResponse = await makeRequest('POST', `/locations/${LOCATION_ID}/memories`, invalidMemory);
  assertStatus(memoryResponse, 400, 'Invalid memory data should return 400');
  
  // Test invalid flower data
  const invalidFlower = {
    lat: 200, // Invalid latitude
    lon: 200, // Invalid longitude
    texture: 'invalid', // Invalid texture
    name: '' // Empty name
  };
  
  const flowerResponse = await makeRequest('POST', '/flowers', invalidFlower);
  assertStatus(flowerResponse, 400, 'Invalid flower data should return 400');
}

async function testNotFoundErrors() {
  console.log('\n🔍 Testing Not Found Errors...');
  
  // Test non-existent memory
  const memoryResponse = await makeRequest('GET', '/memories/non-existent-id');
  assertStatus(memoryResponse, 404, 'Non-existent memory should return 404');
  
  // Test non-existent flower
  const flowerResponse = await makeRequest('GET', '/flowers/non-existent-id');
  assertStatus(flowerResponse, 404, 'Non-existent flower should return 404');
}

async function testInvalidGeohash() {
  console.log('\n📍 Testing Invalid Geohash...');
  const response = await makeRequest('GET', '/locations/abc/memories');
  assertStatus(response, 400, 'Invalid geohash should return 400');
}

async function testInvalidBBox() {
  console.log('\n🗺️ Testing Invalid BBox...');
  const response = await makeRequest('GET', '/flowers?bbox=invalid');
  assertStatus(response, 400, 'Invalid BBox should return 400');
}

async function testCleanup() {
  console.log('\n🧹 Testing Cleanup...');
  
  if (createdMemoryId) {
    const response = await makeRequest('DELETE', `/memories/${createdMemoryId}`);
    assertStatus(response, 204, 'Memory deletion should return 204');
    console.log(`Deleted memory: ${createdMemoryId}`);
  }
  
  if (createdFlowerId) {
    const response = await makeRequest('DELETE', `/flowers/${createdFlowerId}`);
    assertStatus(response, 204, 'Flower deletion should return 204');
    console.log(`Deleted flower: ${createdFlowerId}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Start Screen API Test Suite');
  console.log('=====================================');
  
  try {
    await testHealthCheck();
    await testCreateMemory();
    await testListMemories();
    await testUpdateMemory();
    await testCreateFlower();
    await testListFlowers();
    await testFlowerBBoxFilter();
    await testFlowerOwnerFilter();
    await testValidationErrors();
    await testNotFoundErrors();
    await testInvalidGeohash();
    await testInvalidBBox();
    await testCleanup();
    
    console.log('\n🎉 All tests passed successfully!');
    console.log('=====================================');
    
  } catch (error) {
    console.log(`\n💥 Test failed: ${error.message}`);
    console.log('=====================================');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests, makeRequest };
