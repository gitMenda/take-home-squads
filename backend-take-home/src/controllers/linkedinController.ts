import { Request, Response } from 'express';
import { LinkedInProfile } from '../models/Profile';
import { LinkedInPost } from '../models/Post';
import { fetchLinkedInProfile, fetchLinkedInPosts, extractLinkedInUsername } from '../services/linkedinService';

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
  const { senderUrl, receiverUrl, proposal } = req.body;

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
    const [senderData, receiverData, receiverPostsData] = await Promise.all([
      fetchLinkedInProfile(senderUsername),
      fetchLinkedInProfile(receiverUsername),
      fetchLinkedInPosts(receiverUsername)
    ]);

    // Instantiate data models and prepare the prompt
    const senderProfile = transformProfileData(senderData);
    const receiverProfile = transformProfileData(receiverData);
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

    let openAIPrompt = `Generate a professional and friendly icebreaker message from ${senderProfile.firstName} to ${receiverProfile.firstName}.`;
    openAIPrompt += `\n\n**Sender's Information:**`;
    openAIPrompt += `\n- Name: ${senderProfile.firstName} ${senderProfile.lastName}`;
    openAIPrompt += `\n- Headline: ${senderProfile.headline}`;
    openAIPrompt += `\n- Current Role: ${senderProfile.currentPosition?.title || 'N/A'}`;
    openAIPrompt += `\n\n**Receiver's Information:**`;
    openAIPrompt += `\n- Name: ${receiverProfile.firstName} ${receiverProfile.lastName}`;
    openAIPrompt += `\n- Headline: ${receiverProfile.headline}`;
    openAIPrompt += `\n- Summary: ${receiverProfile.summary}`;
    openAIPrompt += `\n- Recent Posts:`;
    receiverPosts.slice(0, 5).forEach((post: { text: string; likeCount: any; }, index: number) => {
      openAIPrompt += `\n  - Post ${index + 1}: "${post.text.substring(0, 200)}..." (Likes: ${post.likeCount})`;
    });
    openAIPrompt += `\n\n**Objective:** ${proposal}`;
    openAIPrompt += `\n\nGenerate a compelling message to start the conversation.`;

    // Assume callOpenAI function exists in a separate service file
    // const openaiResponse = await callOpenAI(openAIPrompt);
    // res.json({ message: openaiResponse });

    // For now, return the prepared prompt to show the logic is working
    res.json({ message: openAIPrompt });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};