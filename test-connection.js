// Test Kiro Connection with Real Auth
console.log('🧪 Testing Kiro IDE Connection...');

// Test environment variables
console.log('Environment Variables:');
console.log('VITE_KIRO_ENABLED:', process.env.VITE_KIRO_ENABLED || 'undefined');
console.log('VITE_KIRO_API_URL:', process.env.VITE_KIRO_API_URL || 'undefined');

// Test server health
fetch('http://localhost:3001/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Server Health:', data.status);
    console.log('📊 Services:', Object.keys(data.services).join(', '));
  })
  .catch(error => {
    console.error('❌ Server Health Check Failed:', error.message);
  });

// Test auth endpoint (without token - should fail)
fetch('http://localhost:3001/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectId: 'conceptpulse-mvp' })
})
  .then(response => {
    console.log('🔐 Auth Test (no token):', response.status);
    if (response.status === 401) {
      console.log('✅ Server correctly rejects requests without tokens');
    }
  })
  .catch(error => {
    console.error('❌ Auth Test Failed:', error.message);
  });