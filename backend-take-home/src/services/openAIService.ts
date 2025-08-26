// src/services/openAIService.ts

import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const callOpenAI = async (prompt: string): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // could be changed to other models
      messages: [
        {
          role: "system",
          content: "You are a professional networking assistant. You generate compelling and personalized icebreaker messages for LinkedIn. Your tone should be friendly yet professional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    // Extract the generated message from the response
    const generatedMessage = chatCompletion.choices[0].message?.content;

    if (!generatedMessage) {
      throw new Error("OpenAI API returned an empty response.");
    }

    return generatedMessage;
    
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`Failed to generate icebreaker message.`);
  }
};