import * as dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables from .env file
dotenv.config();

const instanceUrl = process.env.SNOW_INSTANCE_URL; // Corrected name
const username = process.env.SNOW_USERNAME;
const password = process.env.SNOW_PASSWORD;

// Basic function to test credentials and connection
async function testServiceNowConnection() {
  if (!instanceUrl || !username || !password) {
    return;
  }

  const url = `${instanceUrl}/api/now/table/incident?sysparm_limit=1`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.statusText}`);
    }
    
    const data = await response.json();
    // console.log("Connection successful. Sample response:", data);
  } catch (error) {
    // console.error("Error connecting to ServiceNow:", error.message);
  }
}

// Run the test
// testServiceNowConnection();