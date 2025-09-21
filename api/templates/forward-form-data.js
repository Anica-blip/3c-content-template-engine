// Add this test function to your HTML <script> section
async function testForwardEndpoint() {
    try {
        console.log('Testing forward endpoint...');
        const response = await fetch(`${API_BASE_URL}/templates/forward-form-data`, {
            method: 'GET' // Just test if endpoint exists
        });
        
        console.log('Forward endpoint response status:', response.status);
        console.log('Forward endpoint response:', await response.text());
        
        if (response.status === 405) {
            alert('✅ Forward endpoint EXISTS (Method not allowed is expected for GET)');
        } else if (response.status === 404) {
            alert('❌ Forward endpoint MISSING - File not deployed correctly');
        } else {
            alert(`⚠️ Forward endpoint status: ${response.status}`);
        }
    } catch (error) {
        console.error('Forward endpoint test failed:', error);
        alert('❌ Forward endpoint ERROR: ' + error.message);
    }
}

// Call this test function in console to check
testForwardEndpoint();
