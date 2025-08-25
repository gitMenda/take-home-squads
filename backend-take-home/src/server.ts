import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// LinkedIn API configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'real-time-people-company-data.p.rapidapi.com';
const RAPIDAPI_URL = process.env.RAPIDAPI_URL || 'https://linkedin-data-api.p.rapidapi.com';

// Function to extract LinkedIn username from URL
const extractLinkedInUsername = (url: string): string | null => {
  const match = url.match(/linkedin\.com\/in\/([^\/]+)/);
  return match ? match[1] : null;
};

// Function to fetch LinkedIn profile data
const fetchLinkedInProfile = async (username: string) => {
  try {
    const response = await axios.get(`${RAPIDAPI_URL}`, {
      params: {
        username: username
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching LinkedIn profile for ${username}:`, error);
    throw new Error(`Failed to fetch LinkedIn profile: ${username}`);
  }
};

app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api", (req, res) => {
  const { text } = req.body;
  res.json({ reply: `Backend received: "${text}"` });
});

// Updated icebreaker generation route
app.post("/api/generate-icebreaker", async (req, res) => {
  const { senderUrl, receiverUrl, problem, proposal, writingStyle } = req.body;

  console.log("Received icebreaker request:", req.body);

  // Validate required fields
  if (!senderUrl || !receiverUrl || !proposal) {
    return res.status(400).json({ 
      error: "Missing required fields",
      message: "senderUrl, receiverUrl, and proposal are required"
    });
  }

  // Validate API key
  if (!RAPIDAPI_KEY) {
    return res.status(500).json({
      error: "Server configuration error",
      message: "LinkedIn API key not configured"
    });
  }

  try {
    // Extract usernames from LinkedIn URLs
    const senderUsername = extractLinkedInUsername(senderUrl);
    const receiverUsername = extractLinkedInUsername(receiverUrl);

    if (!senderUsername || !receiverUsername) {
      return res.status(400).json({
        error: "Invalid LinkedIn URLs",
        message: "Please provide valid LinkedIn profile URLs"
      });
    }

    console.log(`Fetching profiles: sender=${senderUsername}, receiver=${receiverUsername}`);

    // Fetch both LinkedIn profiles concurrently
    const [senderProfile, receiverProfile] = await Promise.all([
      fetchLinkedInProfile(senderUsername),
      fetchLinkedInProfile(receiverUsername)
    ]);

    console.log("Successfully fetched LinkedIn profiles");

    // Create detailed response message
    let responseMessage = `Request to generate icebreaker message received with the following information:\n\n`;
    responseMessage += `=== SENDER INFORMATION ===\n`;
    responseMessage += `- LinkedIn URL: ${senderUrl}\n`;
    responseMessage += `- Name: ${senderProfile.firstName} ${senderProfile.lastName}\n`;
    responseMessage += `- Headline: ${senderProfile.headline || 'N/A'}\n`;
    responseMessage += `- Location: ${senderProfile.locationName || 'N/A'}\n\n`;

    responseMessage += `=== RECEIVER INFORMATION ===\n`;
    responseMessage += `- LinkedIn URL: ${receiverUrl}\n`;
    responseMessage += `- Name: ${receiverProfile.firstName} ${receiverProfile.lastName}\n`;
    responseMessage += `- Headline: ${receiverProfile.headline || 'N/A'}\n`;
    responseMessage += `- Location: ${receiverProfile.locationName || 'N/A'}\n`;
    responseMessage += `- Summary: ${receiverProfile.summary ? receiverProfile.summary.substring(0, 200) + '...' : 'N/A'}\n\n`;

    responseMessage += `=== MESSAGE PARAMETERS ===\n`;
    responseMessage += `- Proposal/Solution/Objective: ${proposal}\n`;
    
    if (problem && problem.trim()) {
      responseMessage += `- Problem to solve: ${problem}\n`;
    }
    
    if (writingStyle && writingStyle.trim()) {
      responseMessage += `- Writing style: ${writingStyle}\n`;
    }

    // Return comprehensive response
    res.json({
      message: responseMessage,
      id: `icebreaker_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "profiles_fetched",
      profiles: {
        sender: {
          username: senderUsername,
          name: `${senderProfile.firstName} ${senderProfile.lastName}`,
          headline: senderProfile.headline,
          location: senderProfile.locationName
        },
        receiver: {
          username: receiverUsername,
          name: `${receiverProfile.firstName} ${receiverProfile.lastName}`,
          headline: receiverProfile.headline,
          location: receiverProfile.locationName,
          summary: receiverProfile.summary
        }
      },
      parameters: {
        problem,
        proposal,
        writingStyle
      }
    });

  } catch (error) {
    console.error("Error processing icebreaker request:", error);
    
    res.status(500).json({
      error: "Failed to process request",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      id: `icebreaker_error_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});