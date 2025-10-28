'use server';
/**
 * @fileOverview A "Millionaire Mindset" AI mentor.
 *
 * - getMentorResponse - A function that handles the AI mentor's chat response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatHistorySchema = z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
}));
export type ChatHistory = z.infer<typeof ChatHistorySchema>;


const systemPrompts = {
    GREETING: `You are an AI mentor for the "Millionaire Mindset" platform. Your name is 'M'. You have just greeted the user. Now they are telling you about their goals. Analyze their message and provide simple, actionable advice based on the principles of the "Millionaire Mindset" (e.g., investing, side hustles, positive mindset, law of attraction). After giving advice, ask a follow-up question to keep the conversation going.`,
    PROVIDE_ADVICE: `You are an AI mentor named 'M'. The user is responding to your advice. Continue the conversation by providing more specific tips or asking clarifying questions. Keep your responses encouraging and focused on actionable steps. If the user seems to be finishing the conversation (e.g., says "thank you", "thanks"), provide a concluding, encouraging remark and wish them well on their journey.`,
    CONCLUDED: `You are an AI mentor named 'M'. The user is thanking you and likely ending the conversation. Provide a brief, warm, and encouraging closing statement. Wish them the best on their journey to financial success.`,
};

function determineSystemPrompt(history: ChatHistory, userMessage: string): string {
    if (history.length < 2) { // Initial interaction (greeting + first user message)
        return systemPrompts.GREETING;
    }
    if (userMessage.toLowerCase().includes('thank you') || userMessage.toLowerCase().includes('thanks')) {
        return systemPrompts.CONCLUDED;
    }
    return systemPrompts.PROVIDE_ADVICE;
}


export async function getMentorResponse(history: ChatHistory, userMessage: string, userName: string) {
    try {
        const systemPrompt = determineSystemPrompt(history, userMessage);

        const messages: Array<{role: string, content: Array<{text: string}>}> = history.map(entry => ({
            role: entry.role,
            content: [{ text: entry.content }],
        }));

        console.log("🟢 Calling Gemini model with:", { userMessage, systemPrompt });

        const llmResponse = await ai.generate({
            model: 'gemini-1.5-flash-latest',
            prompt: userMessage,
            system: systemPrompt + ` Address the user as ${userName} when appropriate.`,
            history: messages,
        });

        console.log("🟢 Gemini response:", llmResponse.text);

        if (!llmResponse.text) {
             throw new Error('Empty response from Genkit.');
        }

        return llmResponse.text;
    } catch (err: any) {
        console.error("🔴 Error inside getMentorResponse:", err);
        // Return a user-friendly error message, but the actual error is logged on the server.
        throw err;
  }
}
