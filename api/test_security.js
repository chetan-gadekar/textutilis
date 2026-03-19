
require('dotenv').config();
const { getSignedGetUrl } = require('./utils/r2Client');
const axios = require('axios');

async function test() {
    // A known file key from a previous successful upload
    const fileKey = 'lms_videos/c0157077-bd7e-40ec-944f-f4c029df4f79-demo.mp4';
    
    console.log('--- SECURITY VERIFICATION ---');
    console.log('Generating 5-second signed URL...');
    const url = await getSignedGetUrl(fileKey, 5);
    
    if (!url) {
        console.error('Failed to generate URL. Check your R2 credentials in .env');
        return;
    }
    
    console.log('URL generated successfully.');

    try {
        console.log('Testing URL immediately (Expecting 200 OK)...');
        // Note: We use HEAD to avoid downloading the whole video
        const res1 = await axios.head(url);
        console.log('Immediate status:', res1.status, res1.statusText);
    } catch (err) {
        console.error('Immediate test failed:', err.message);
        if (err.response) console.log('Response:', err.response.status, err.response.data);
    }

    console.log('Waiting 10 seconds for expiration...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
        console.log('Testing URL after expiration (Expecting 403 Forbidden)...');
        const res2 = await axios.head(url);
        console.log('After wait status:', res2.status, '(FAIL: Should have expired)');
    } catch (err) {
        if (err.response) {
            console.log('After wait status:', err.response.status, '(SUCCESS: URL is now Forbidden/Expired)');
            // console.log('Error details:', err.response.data);
        } else {
            console.error('After wait test failed:', err.message);
        }
    }
    console.log('--- VERIFICATION COMPLETE ---');
}

test();
