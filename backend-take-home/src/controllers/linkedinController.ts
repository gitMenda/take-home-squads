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

export const generateIcebreaker = async (req: Request, res: Response): Promise<Response | void> => {
  console.log("Entered generateIcebreaker function with body:", req.body);
  const { senderUrl, receiverUrl, problem, proposal, writingStyle } = req.body;

  if (!senderUrl || !receiverUrl || !proposal) {
    res.status(400).json({ error: 'Missing required parameters: senderUrl, receiverUrl, and proposal.' });
    return;
  }

  const senderUsername = extractLinkedInUsername(senderUrl);
  const receiverUsername = extractLinkedInUsername(receiverUrl);

  if (!senderUsername || !receiverUsername) {
    res.status(400).json({ error: 'Invalid LinkedIn URLs. Please provide valid LinkedIn profile URLs.' });
    return;
  }

  // Use a single try/catch for unexpected errors
  try {
    // Use Promise.allSettled() to get results from all promises, regardless of success or failure
    const results = await Promise.allSettled([
      fetchLinkedInProfile(senderUsername),
      fetchLinkedInProfile(receiverUsername),
      fetchLinkedInPosts(senderUsername),
      fetchLinkedInPosts(receiverUsername)
    ]);

    const [senderProfileResult, receiverProfileResult, senderPostsResult, receiverPostsResult] = results;

    // Handle sender profile errors and return directly
    if (senderProfileResult.status === 'rejected') {
      console.error("Sender profile fetch failed:", senderProfileResult.reason);
      if (senderProfileResult.reason.message.includes("Profile not found")) {
        return res.status(404).json({
          error: 'Sender profile not found',
          message: `The sender's LinkedIn profile could not be found. Please check the URL and try again.`
        });
      }
      return res.status(500).json({
        error: 'Sender data fetch failed',
        message: 'An unexpected error occurred while fetching the sender\'s profile.'
      });
    }

    // Handle receiver profile errors and return directly
    if (receiverProfileResult.status === 'rejected') {
      console.error("Receiver profile fetch failed:", receiverProfileResult.reason);
      if (receiverProfileResult.reason.message.includes("Profile not found")) {
        return res.status(404).json({
          error: 'Receiver profile not found',
          message: `The receiver's LinkedIn profile could not be found. Please check the URL and try again.`
        });
      }
      return res.status(500).json({
        error: 'Receiver data fetch failed',
        message: 'An unexpected error occurred while fetching the receiver\'s profile.'
      });
    }

    // If we get here, both profiles were found successfully.
    // Now you can safely access the data.
    const senderData = senderProfileResult.value;
    const receiverData = receiverProfileResult.value;

    // Handle posts separately, as they are not critical for a basic response
    const senderPostsData = senderPostsResult.status === 'fulfilled' ? senderPostsResult.value : null;
    const receiverPostsData = receiverPostsResult.status === 'fulfilled' ? receiverPostsResult.value : null;

    const senderProfile = transformProfileData(senderData);
    const receiverProfile = transformProfileData(receiverData);

    const senderPosts = senderPostsData?.data?.length > 0 ? senderPostsData.data.map(
      (post: any) => new LinkedInPost(post.text, post.totalReactionCount, post.likeCount, post.commentsCount, post.repostsCount, post.postUrl, post.postedDate, post.author, post.contentType)
    ) : [];

    const receiverPosts = receiverPostsData?.data?.length > 0 ? receiverPostsData.data.map(
      (post: any) => new LinkedInPost(post.text, post.totalReactionCount, post.likeCount, post.commentsCount, post.repostsCount, post.postUrl, post.postedDate, post.author, post.contentType)
    ) : [];

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
    ${receiverPosts.slice(0, 10).map((post: LinkedInPost, index: number) => `- Post ${index + 1}: "${post.text.substring(0, 200)}..." (Likes: ${post.likeCount})`).join('\n')}
    
    **Connection Objective:**
    - The objective of this connection is: ${proposal}. It is important that the messages align with this goal.
    ${problem ? `- The sender specified this specific challenge: ${problem}.` : ''}
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