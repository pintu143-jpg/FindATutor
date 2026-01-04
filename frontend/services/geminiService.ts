import { GoogleGenAI, Type } from "@google/genai";
import { Tutor, SmartMatchResponse } from '../types';

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to generate a bio for a teacher
export const generateTutorBio = async (
  experience: string,
  subjects: string,
  style: string
): Promise<string> => {
  try {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are an expert copywriter for an educational platform. 
      Write a professional, engaging, and trustworthy bio (max 80 words) for a tutor with the following details:
      - Experience: ${experience}
      - Subjects: ${subjects}
      - Teaching Style: ${style}
      
      Instructions:
      1. Naturally incorporate relevant keywords and terminology associated with the subjects listed (e.g., if 'Math', mention specific topics like algebra or calculus if appropriate contextually).
      2. Reflect the 'Teaching Style' in the tone of the bio.
      3. Do not include "Here is a bio" or quotes. Just the raw bio text.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Experienced tutor ready to help you learn.";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Passionate tutor dedicated to student success. (AI generation unavailable)";
  }
};

// Smart Match Logic
export const findSmartMatches = async (
  userQuery: string,
  tutors: Tutor[]
): Promise<SmartMatchResponse> => {
  try {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    
    // Create a simplified list of tutors for the prompt to save tokens/complexity
    const tutorContext = tutors.map(t => ({
      id: t.id,
      name: t.name,
      subjects: t.subjects.join(", "),
      bio: t.bio,
      rate: t.hourlyRate,
      city: t.city
    }));

    const prompt = `
      You are an intelligent educational consultant.
      User Request: "${userQuery}"

      Available Tutors:
      ${JSON.stringify(tutorContext)}

      Task:
      1. Analyze the user's request and the tutors' profiles.
      2. Select up to 3 tutor IDs that best match the user's specific needs (subject, level, inferred price sensitivity, location, or specific keywords).
      3. Provide a very brief reasoning (max 1 sentence) explaining why these tutors were selected as a group.

      Output JSON format:
      {
        "recommendedTutorIds": ["id1", "id2"],
        "reasoning": "We selected these tutors because..."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTutorIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return JSON.parse(jsonText) as SmartMatchResponse;

  } catch (error) {
    console.error("Error in smart match:", error);
    return {
      recommendedTutorIds: [],
      reasoning: "We couldn't process your smart match request at this time. Please try browsing the list or check if the API Key is configured."
    };
  }
};