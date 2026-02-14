
const fetch = require('node-fetch');

async function testCreateCategory() {
    try {
        const response = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // You might need to add an auth token here if you have one, 
                // but first let's see if we can trigger it without one or if 403 works
            },
            body: JSON.stringify({
                name: "Test Category",
                description: "Test Description"
            })
        });
        
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (error) {
        console.error("Error:", error);
    }
}

testCreateCategory();
