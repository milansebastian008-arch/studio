
'use server';
/**
 * @fileoverview A multi-turn AI mentor flow.
 *
 * This file defines the logic for a conversational AI mentor that guides
 * the user through a series of questions to provide personalized advice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the stages of the conversation
const ConversationStage = z.enum([
  'GREETING',
  'ASK_GOALS',
  'PROVIDE_ADVICE',
  'CONCLUDED',
]);
export type ConversationStage = z.infer<typeof ConversationStage>;

// Input schema for the AI flow
export const MentorFlowInputSchema = z.object({
  currentStage: ConversationStage,
  userMessage: z.string().optional(),
  userName: z.string().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});
export type MentorFlowInput = z.infer<typeof MentorFlowInputSchema>;

// Output schema for the AI flow
export const MentorFlowOutputSchema = z.object({
  nextStage: ConversationStage,
  mentorResponse: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
});
export type MentorFlowOutput = z.infer<typeof MentorFlowOutputSchema>;


/**
 * A server action that processes the user's message and current conversation stage
 * to generate the next response from the AI mentor.
 */
export async function getMentorResponse(
  input: MentorFlowInput
): Promise<MentorFlowOutput> {
  // Directly call the Genkit flow
  return mentorFlow(input);
}


// This is the main Genkit flow that orchestrates the conversation
const mentorFlow = ai.defineFlow(
  {
    name: 'mentorFlow',
    inputSchema: MentorFlowInputSchema,
    outputSchema: MentorFlowOutputSchema,
  },
  async (input) => {
    let nextStage: ConversationStage = input.currentStage;
    let systemPrompt = '';
    
    // The very first interaction is handled by the client, so the first time this
    // flow is called, it will be with the user's first message.
    if (input.currentStage === 'GREETING') {
      nextStage = 'ASK_GOALS';
    }


    // Determine the system prompt based on the next stage
    switch (nextStage) {
      case 'ASK_GOALS':
        systemPrompt = `You are an AI mentor for the "Millionaire Mindset" platform. Your name is 'M'. The user has just sent their first message in response to your greeting. Your task is to analyze their message and provide simple, actionable advice based on the principles of the "Millionaire Mindset" (e.g., investing, side hustles, positive mindset, law of attraction). After giving advice, ask a follow-up question to keep the conversation going.`;
        nextStage = 'PROVIDE_ADVICE';
        break;
      case 'PROVIDE_ADVICE':
         systemPrompt = `You are an AI mentor. The user is responding to your advice. Continue the conversation by providing more specific tips or asking clarifying questions. Keep your responses encouraging and focused on actionable steps. If the user seems to be finishing the conversation, provide a concluding, encouraging remark and wish them well on their journey.`;
        // Heuristic to decide if we should conclude or continue
        if (input.userMessage && (input.userMessage.toLowerCase().includes('thank you') || input.userMessage.toLowerCase().includes('thanks'))) {
            nextStage = 'CONCLUDED';
            systemPrompt = `You are an AI mentor. The user is thanking you and ending the conversation. Provide a brief, warm, and encouraging closing statement. Wish them the best on their journey to financial success.`
        } else {
            nextStage = 'PROVIDE_ADVICE'; // Stay in this stage
        }
        break;
      case 'CONCLUDED':
        // Should not happen, but as a fallback
        return {
            nextStage: 'CONCLUDED',
            mentorResponse: 'It was great talking to you. Best of luck!',
            conversationHistory: input.conversationHistory || [],
        };
      default:
        // Default case for GREETING or any other unhandled stage
        systemPrompt = `You are an AI mentor for the "Millionaire Mindset" platform. Your name is 'M'. Your task is to analyze the user's message and provide simple, actionable advice. After giving advice, ask a follow-up question to keep the conversation going.`
        nextStage = 'PROVIDE_ADVICE'
        break;
    }

    const historyForPrompt = (input.conversationHistory || []).map(entry => ({
      role: entry.role,
      content: [{ text: entry.content }],
    }));

    const userName = input.userName || 'there';

    // Call the Gemini model
    const llmResponse = await ai.generate({
      model: 'gemini-1.5-flash-latest',
      prompt: input.userMessage || '', // User message is the main prompt
      system: systemPrompt + ` Address the user as ${userName} when appropriate.`,
      history: historyForPrompt,
    });

    const mentorResponse = llmResponse.text;
    
    // Build the new conversation history
    const newHistory = [...(input.conversationHistory || [])];
    if (input.userMessage) {
        newHistory.push({ role: 'user', content: input.userMessage });
    }
    newHistory.push({ role: 'model', content: mentorResponse });

    return {
      nextStage,
      mentorResponse,
      conversationHistory: newHistory,
    };
  }
);
