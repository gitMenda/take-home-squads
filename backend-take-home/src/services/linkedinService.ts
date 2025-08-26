import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'real-time-people-company-data.p.rapidapi.com';
const RAPIDAPI_PROFILE_URL = process.env.RAPIDAPI_URL || 'https://linkedin-data-api.p.rapidapi.com';
const RAPIDAPI_POSTS_URL = `${process.env.RAPIDAPI_URL}/get-profile-posts` || 'https://linkedin-data-api.p.rapidapi.com/get-profile-posts';

// Helper function to extract LinkedIn username from URL
export const extractLinkedInUsername = (url: string): string | null => {
  const match = url.match(/linkedin\.com\/in\/([^\/]+)/);
  return match ? match[1] : null;
};

// Function to fetch LinkedIn profile data
export const fetchLinkedInProfile = async (username: string) => {
    if (!RAPIDAPI_KEY) {
      throw new Error("LinkedIn API key not configured");
    }
  
    try {
      const response = await axios.get(RAPIDAPI_PROFILE_URL, {
        params: { username: username },
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        }
      });
  
      // Check the response body for the 'success' field
      if (response.data.success === false) {
        // The API returned 200, but the profile wasn't found.
        // Throw a specific error that your controller can catch.
        throw new Error(`Profile not found for username: ${username}. Reason: ${response.data.message}`);
      }
  
      return response.data;
  
    } catch (error) {
      // Keep this catch block for other potential errors (e.g., network issues, invalid API keys).
      // The specific 'Not Found' error is now handled above.
      console.error(`Error fetching LinkedIn profile for ${username}:`, error);
      throw new Error(`Failed to fetch LinkedIn profile. The service may be unavailable or the URL is incorrect.`);
    }
  };

// Function to fetch LinkedIn posts data
export const fetchLinkedInPosts = async (username: string) => {
  if (!RAPIDAPI_KEY) {
    throw new Error("LinkedIn API key not configured");
  }

  try {
    const response = await axios.get(RAPIDAPI_POSTS_URL, {
      params: { username: username },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error(`Profile not found for username: ${username}`);
      }
  
      if (response.data.success === false) {
          throw new Error(`Profile not found for username: ${username}. Reason: ${response.data.message}`);
      }
      
      return response.data;
  
    } catch (error) {
      // Keep this catch block for other potential errors (e.g., network issues, invalid API keys).
      // The specific 'Not Found' error is now handled above.
      console.error(`Error fetching LinkedIn profile for ${username}:`, error);
      throw new Error(`Failed to fetch LinkedIn profile. The service may be unavailable or the URL is incorrect.`);
    }
  };