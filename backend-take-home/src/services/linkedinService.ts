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
    return response.data;
  } catch (error) {
    console.error(`Error fetching LinkedIn profile for ${username}:`, error);
    throw new Error(`Failed to fetch LinkedIn profile for: ${username}`);
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
    return response.data;
  } catch (error) {
    console.error(`Error fetching LinkedIn posts for ${username}:`, error);
    throw new Error(`Failed to fetch LinkedIn posts for: ${username}`);
  }
};