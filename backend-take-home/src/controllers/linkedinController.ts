import { Request, Response } from 'express';
import { LinkedInProfile } from '../models/Profile';
import { LinkedInPost } from '../models/Post';
import { fetchLinkedInProfile, fetchLinkedInPosts, extractLinkedInUsername } from '../services/linkedinService';
import { callOpenAI } from '../services/openAIService';

// A helper function to transform raw JSON into our class instances
function transformProfileData(data: any): LinkedInProfile {
  return new LinkedInProfile(
    data.id,
    data.urn,
    data.username,
    data.firstName,
    data.lastName,
    data.isTopVoice,
    data.isCreator,
    data.isPremium,
    data.profilePicture,
    data.summary,
    data.headline,
    data.geo,
    data.educations,
    data.position,
    data.skills
  );
}

// Main function to handle the API request
export const generateIcebreaker = async (req: Request, res: Response): Promise<void> => {
  console.log("Entered generateIcebreaker function with body:", req.body);
  const { senderUrl, receiverUrl, problem, proposal, writingStyle } = req.body;

  if (!senderUrl || !receiverUrl || !proposal) {
    res.status(400).json({ error: 'Missing required parameters: senderUrl, receiverUrl, and proposal.' });
    return;
  }

  try {
    const senderUsername = extractLinkedInUsername(senderUrl);
    const receiverUsername = extractLinkedInUsername(receiverUrl);

    if (!senderUsername || !receiverUsername) {
      res.status(400).json({ error: 'Invalid LinkedIn URLs. Please provide valid LinkedIn profile URLs.' });
      return;
    }

    // Fetch data from external APIs (delegated to the service)
    const [senderData, receiverData, senderPostsData, receiverPostsData] = await Promise.all([
      fetchLinkedInProfile(senderUsername),
      fetchLinkedInProfile(receiverUsername),
      fetchLinkedInPosts(senderUsername),
      fetchLinkedInPosts(receiverUsername)
    ]);

    // Instantiate data models and prepare the prompt
    const senderProfile = transformProfileData(senderData);
    const receiverProfile = transformProfileData(receiverData);
    const senderPosts = senderPostsData.data.map(
      (post: any) => new LinkedInPost(
        post.text,
        post.totalReactionCount,
        post.likeCount,
        post.commentsCount,
        post.repostsCount,
        post.postUrl,
        post.postedDate,
        post.author,
        post.contentType
      )
    );
    const receiverPosts = receiverPostsData.data.map(
      (post: any) => new LinkedInPost(
        post.text,
        post.totalReactionCount,
        post.likeCount,
        post.commentsCount,
        post.repostsCount,
        post.postUrl,
        post.postedDate,
        post.author,
        post.contentType
      )
    );

    let openAIPrompt = `
    You are a highly skilled professional networking assistant specializing in generating compelling and human-like LinkedIn messages. Your goal is to craft three distinct icebreaker messages for a connection request. These messages must be genuine, non-salesy, and tailored specifically to the recipient.
    
    **Instructions:**
    - **Tone & Style:** Adopt a tone and style that is sincere and human, avoiding anything that sounds "salesy" or "AI-generated. Infer the country and tone from the sender's recent posts and information."
    - **Personalization:** Messages may reference a specific detail from the receiver's profile or recent posts. This could be a shared connection, a recent accomplishment, a project they mentioned, or a topic they posted about. However, messages can also be more direct and to the point as well.
    - **Language:** The messages should be in the language of the receiver's recent posts.
    - **Sender's Context:** Integrate the sender's professional background and interests, as inferred from their headline, summary, and recent posts, into the messages to establish a genuine connection.
    
    **Sender's Information:**
    - Name: ${senderProfile.firstName} ${senderProfile.lastName}
    - Headline: ${senderProfile.headline}
    - Summary: ${senderProfile.summary}
    - Current Role: ${senderProfile.currentPosition?.title || 'N/A'}
    - Recent Posts (for inferring style and interests):
    ${senderPosts.slice(0, 5).map((post: LinkedInPost, index: number) => `- Post ${index + 1}: "${post.text.substring(0, 200)}..." (Likes: ${post.likeCount})`).join('\n')}
    
    **Receiver's Information:**
    - Name: ${receiverProfile.firstName} ${receiverProfile.lastName}
    - Headline: ${receiverProfile.headline}
    - Summary: ${receiverProfile.summary}
    - Recent Posts (for personalization cues):
    ${receiverPosts.slice(0, 5).map((post: LinkedInPost, index: number) => `- Post ${index + 1}: "${post.text.substring(0, 200)}..." (Likes: ${post.likeCount})`).join('\n')}
    
    **Connection Objective:**
    - The reason for connecting is: ${proposal}
    ${writingStyle ? `- The desired writing style from the sender is also: ${writingStyle}.` : ''}
    
    **Output Format:**
    - Message 1: [Text of the first personalized message]
    - Message 2: [Text of the second personalized message]
    - Message 3: [Text of the third personalized message]
    
    Respect the format strictly, as the output will be parsed programmatically. Do not add * or any other characters besides what the format specifies.
    `

    console.log("Generated OpenAI Prompt:", openAIPrompt);

    const openaiResponseText = await callOpenAI(openAIPrompt);

    console.log("OpenAI Response Text:", openaiResponseText);

    // Parse the single string response into an array of messages
    const messagesArray = openaiResponseText.split(/Message \d: /).filter(msg => msg.trim() !== '' && msg.trim() !== '-');

    console.log("Parsed Messages Array:", messagesArray);

    res.json({ messages: messagesArray });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};