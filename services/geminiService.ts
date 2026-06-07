import { Tutor, SmartMatchResponse } from '../types';
import { apiService } from './apiService';

// Helper to generate a bio for a teacher
export const generateTutorBio = async (
  experience: string,
  subjects: string,
  style: string
): Promise<string> => {
  try {
    return await apiService.ai.generateBio(experience, subjects, style);
  } catch (error) {
    console.error("Error generating bio via backend:", error);
    return "Passionate tutor dedicated to student success. (AI generation unavailable)";
  }
};

// Smart Match Logic
export const findSmartMatches = async (
  userQuery: string,
  tutors: Tutor[]
): Promise<SmartMatchResponse> => {
  try {
    return await apiService.ai.smartMatch(userQuery, tutors);
  } catch (error) {
    console.error("Error in smart match via backend:", error);
    return {
      recommendedTutorIds: [],
      reasoning: "We couldn't process your smart match request at this time. Please try browsing the list or check if the API server is running."
    };
  }
};