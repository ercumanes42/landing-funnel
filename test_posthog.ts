
import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

async function testPostHogConnection() {
    try {
        console.log('Testing connection to PostHog...');

        // Test endpoint: get current user/organization info or basic events
        // Using a project-level endpoint to verify the key works
        const response = await axios.get(`${POSTHOG_HOST}/api/projects/@current`, {
            headers: {
                'Authorization': `Bearer ${POSTHOG_API_KEY}`
            }
        });

        console.log('Connection Successful!');
        console.log('Project Name:', response.data.name);
        console.log('Project ID:', response.data.id);

        return true;
    } catch (error: any) {
        console.error('Connection Failed:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
            console.error("Error 401: Unauthorized. Please check if the Personal API Key is correct.");
        }
        return false;
    }
}

testPostHogConnection();
