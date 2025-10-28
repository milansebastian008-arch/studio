
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConversationStage = z.enum([
  'GREETING',
  'ASK_GOALS',
  'PROVIDE_ADVICE',
  'CONCLUDED',
]);

const ChatHistorySchema = z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
}));

const systemPrompts = {
    GREETING: `You are an AI mentor for the "Millionaire Mindset" platform. Your name is 'M'. You have just greeted the user. Now they are telling you about their goals. Analyze their message and provide simple, actionable advice based on the principles of the "Millionaire Mindset" (e.g., investing, side hustles, positive mindset, law of attraction). After giving advice, ask a follow-up question to keep the conversation going.`,
    PROVIDE_ADVICE: `You are an AI mentor named 'M'. The user is responding to your advice. Continue the conversation by providing more specific tips or asking clarifying questions. Keep your responses encouraging and focused on actionable steps. If the user seems to be finishing the conversation (e.g., says "thank you", "thanks"), provide a concluding, encouraging remark and wish them well on their journey.`,
    CONCLUDED: `You are an AI mentor named 'M'. The user is thanking you and likely ending the conversation. Provide a brief, warm, and encouraging closing statement. Wish them the best on their journey to financial success.`,
};

function determineNextStage(currentStage: z.infer<typeof ConversationStage>, userMessage: string): z.infer<typeof ConversationStage> {
    if (currentStage === 'GREETING') {
        return 'PROVIDE_ADVICE';
    }
    if (userMessage.toLowerCase().includes('thank you') || userMessage.toLowerCase().includes('thanks')) {
        return 'CONCLUDED';
    }
    return 'PROVIDE_ADVICE';
}


export async function getMentorResponse(history: z.infer<typeof ChatHistorySchema>, userMessage: string, userName: string) {
    
    // The last message from the model is the one we are responding to.
    const lastModelMessage = history.filter(h => h.role === 'model').pop();
    
    // Determine current stage based on some simple logic.
    // This is a simplification. A real app might store stage in the state.
    let currentStage: z.infer<typeof ConversationStage> = 'GREETING';
    if(history.length > 2) { // more than initial greeting and first response
      currentStage = 'PROVIDE_ADVICE';
    }

    const nextStage = determineNextStage(currentStage, userMessage);
    const systemPrompt = systemPrompts[nextStage] || systemPrompts.PROVIDE_ADVICE;

    const historyForPrompt = history.map(entry => ({
        role: entry.role,
        content: [{ text: entry.content }],
    }));

    const llmResponse = await ai.generate({
        model: 'gemini-1.5-flash-latest',
        prompt: userMessage,
        system: systemPrompt + ` Address the user as ${userName} when appropriate.`,
        history: historyForPrompt,
    });

    return llmResponse.text;
}
