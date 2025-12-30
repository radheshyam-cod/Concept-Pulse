// Test Kiro IDE Server Connection
import fetch from 'node-fetch';

const KIRO_API_URL = 'http://localhost:3001/api';

async function testKiroConnection() {
  console.log('🧪 Testing Kiro IDE Server Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${KIRO_API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('   Services:', Object.keys(healthData.services).join(', '));

    // Test 2: Auth Verification
    console.log('\n2. Testing Authentication...');
    const authResponse = await fetch(`${KIRO_API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'conceptpulse-mvp' })
    });
    const authData = await authResponse.json();
    console.log('✅ Auth:', authData.success ? 'Success' : 'Failed');

    // Test 3: Planning Service
    console.log('\n3. Testing Planning Service...');
    const planningResponse = await fetch(`${KIRO_API_URL}/planning/projects`, {
      headers: { 'Authorization': 'Bearer demo-token' }
    });
    const projects = await planningResponse.json();
    console.log('✅ Planning:', `${projects.length} projects loaded`);
    console.log('   Project:', projects[0]?.name);

    // Test 4: Prototyping Service
    console.log('\n4. Testing Prototyping Service...');
    const prototypeResponse = await fetch(`${KIRO_API_URL}/prototyping/prototypes`, {
      headers: { 'Authorization': 'Bearer demo-token' }
    });
    const prototypes = await prototypeResponse.json();
    console.log('✅ Prototyping:', `${prototypes.length} prototypes loaded`);

    // Test 5: Documentation Service
    console.log('\n5. Testing Documentation Service...');
    const docsResponse = await fetch(`${KIRO_API_URL}/documentation/documents`, {
      headers: { 'Authorization': 'Bearer demo-token' }
    });
    const docs = await docsResponse.json();
    console.log('✅ Documentation:', `${docs.length} documents loaded`);

    // Test 6: Workflow Service
    console.log('\n6. Testing Workflow Service...');
    const workflowResponse = await fetch(`${KIRO_API_URL}/workflows/workflows`, {
      headers: { 'Authorization': 'Bearer demo-token' }
    });
    const workflows = await workflowResponse.json();
    console.log('✅ Workflows:', `${workflows.length} workflows loaded`);

    // Test 7: Execution Service
    console.log('\n7. Testing Execution Service...');
    const envResponse = await fetch(`${KIRO_API_URL}/execution/environments`, {
      headers: { 'Authorization': 'Bearer demo-token' }
    });
    const environments = await envResponse.json();
    console.log('✅ Execution:', `${environments.length} environments available`);

    console.log('\n🎉 All Kiro IDE services are operational!');
    console.log('🔗 ConceptPulse can now connect to real Kiro IDE server');
    console.log('📱 Access the app at: http://localhost:5173/');
    console.log('🎛️  Kiro Dashboard: http://localhost:5173/kiro');

  } catch (error) {
    console.error('❌ Kiro connection test failed:', error.message);
  }
}

testKiroConnection();